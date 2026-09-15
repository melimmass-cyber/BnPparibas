import { mkdir, open, readFile, writeFile, unlink } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { createServer } from 'vite';
import { loadConfig } from '../server/config.js';
import { migrate } from '../server/database.js';
import { createStore } from '../server/store.js';
import { buildApp } from '../server/app.js';

// Deliberately separate from server.js: never use embedded storage or preview access in production.
if (process.env.NODE_ENV === 'production') throw new Error('Local mode cannot run with NODE_ENV=production. Use npm start.');
const root = fileURLToPath(new URL('../', import.meta.url));
const directory = new URL('../.local-data/', import.meta.url);
const lockPath = new URL('local.lock', directory);
let database, api, ui, lock, cleanupTimer, stopping;
async function stop() {
  if (stopping) return stopping;
  stopping = (async () => {
    clearInterval(cleanupTimer);
    await ui?.close();
    await api?.close();
    await database?.close();
    if (lock) { await lock.close(); await unlink(lockPath).catch(() => {}); }
  })();
  return stopping;
}
try {
  await mkdir(directory, { recursive: true });
  try { lock = await open(lockPath, 'wx'); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const pid = Number(await readFile(lockPath, 'utf8'));
    let alive = true;
    if (Number.isInteger(pid) && pid > 0) {
      try { process.kill(pid, 0); } catch (error) { if (error.code === 'ESRCH') alive = false; }
    }
    if (alive) throw new Error('Local mode is already running. Open http://127.0.0.1:5180 or stop the existing process first.');
    await unlink(lockPath);
    lock = await open(lockPath, 'wx');
  }
  await lock.writeFile(String(process.pid));
  const keyPath = new URL('session.key', directory);
  let key;
  try { key = await readFile(keyPath, 'utf8'); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    key = randomBytes(32).toString('hex');
    await writeFile(keyPath, key, { flag: 'wx', mode: 0o600 });
  }
  const config = loadConfig({ NODE_ENV: 'development', APP_ORIGIN: 'http://127.0.0.1:3000',
    DATABASE_URL: 'postgresql://local@localhost/local', SESSION_ENCRYPTION_KEY: key.trim() });
  database = new PGlite(fileURLToPath(new URL('postgres/', directory)));
  const adapter = {
    query: async (sql, params) => params ? database.query(sql, params) : (await database.exec(sql)).at(-1),
    connect: async () => ({ ...adapter, release() {} }),
  };
  await migrate(adapter);
  const store = createStore(adapter, config);
  // Local layout access does not create a session or bypass any API authentication.
  api = await buildApp({ config, store, identity: null, logger: false });
  await api.listen({ host: '127.0.0.1', port: 3000 });
  process.env.LOCAL_PREVIEW = '1';
  ui = await createServer({ root, server: { host: '0.0.0.0', port: 5180, strictPort: true }, mode: 'development' });
  await ui.listen();
  cleanupTimer = setInterval(() => store.cleanup().catch(() => console.error('Local database cleanup failed.')), 60_000).unref();
  console.log('\nWebsite:  http://127.0.0.1:5180');
  console.log('myWealth: http://127.0.0.1:5180/mywealth.html');
  console.log('Banking:  http://127.0.0.1:5180/accounts.html');
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses || []) {
      if (address.family === 'IPv4' && !address.internal) console.log('Same Wi-Fi: http://' + address.address + ':5180');
    }
  }
  console.log('Backend:  http://127.0.0.1:3000/health/live');
  console.log('Local preview only. No live sign-in, customer data, or payments. Press Ctrl+C to stop.\n');
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
    const deadline = setTimeout(() => process.exit(1), 15_000).unref();
    stop().then(() => clearTimeout(deadline)).catch(() => process.exit(1));
  });
} catch (error) {
  console.error(error.code === 'EADDRINUSE' ? 'Port 3000 or 5180 is already in use. Stop that local server and run npm run dev again.' : `Local startup failed: ${error.message}`);
  await stop();
  process.exitCode = 1;
}

