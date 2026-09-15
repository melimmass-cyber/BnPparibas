import { loadConfig } from './config.js';
import { connectDatabase, migrate } from './database.js';
import { createStore } from './store.js';
import { createIdentityProvider } from './identity.js';
import { buildApp } from './app.js';
let database, app;
try {
  const config = loadConfig();
  database = connectDatabase(config);
  if (process.argv.includes('--migrate')) {
    await migrate(database);
    await database.end();
    console.log('Database migrations complete.');
  } else {
    const store = createStore(database, config);
    await store.ready();
    const identity = await createIdentityProvider(config);
    app = await buildApp({ config, store, identity });
    const cleanup = setInterval(() => store.cleanup().catch(() => app.log.error('Session cleanup failed')), 60_000);
    cleanup.unref();
    app.addHook('onClose', async () => { clearInterval(cleanup); await database.end(); });
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
      const deadline = setTimeout(() => process.exit(1), 15_000).unref();
      app.close().then(() => clearTimeout(deadline)).catch(() => process.exit(1));
    });
    await app.listen({ port: config.port, host: config.host });
  }
} catch {
  console.error('Backend startup failed. Check configuration, database migrations, and identity provider connectivity.');
  if (app) await app.close(); else if (database) await database.end();
  process.exitCode = 1;
}
