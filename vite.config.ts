import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { createDemoCsv } from './demo-data.js'

// Only the local preview launcher enables labeled demo layouts. Production routes remain protected.
const localPreview = process.env.LOCAL_PREVIEW === '1' && process.env.NODE_ENV !== 'production'
const proxy = {
  '/api': 'http://127.0.0.1:3000',
  '^/auth(?:/|$)': 'http://127.0.0.1:3000',
  '^/portal(?:$|/)': 'http://127.0.0.1:3000',
  '/portal.js': 'http://127.0.0.1:3000',
  '/portal.css': 'http://127.0.0.1:3000',
}

function backendNavigation(): Plugin {
  const install = (server: { middlewares: { use: Function } }) => {
    server.middlewares.use((request: { url?: string }, response: { writeHead: Function; end: Function }, next: Function) => {
      const path = (request.url || '/').split('?')[0]
      if (localPreview) {
        if (path === '/demo-export/portfolio.csv' || path === '/demo-export/deposit.csv') {
          const kind = path.endsWith('/deposit.csv') ? 'deposit' : 'portfolio'
          response.writeHead(200, {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="DEMO-${kind}-summary.csv"`,
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
          })
          response.end(createDemoCsv(kind))
          return
        }
        next(); return
      }
      if (path === '/portal' || /^\/(mywealth|dashboard|accounts|estate-hub|documents|transfers|settings|authentication|connecting|authentication-wait|authentication-success|mywealth-loading)\.html$/.test(path)) {
        const target = path === '/mywealth.html' ? '/' : '/portal'
        response.writeHead(302, { Location: (process.env.APP_ORIGIN || 'http://localhost:3000') + target, 'Cache-Control': 'no-store' })
        response.end()
        return
      }
      next()
    })
  }
  return { name: 'backend-private-navigation', configureServer: install, configurePreviewServer: install }
}
export default defineConfig({
  plugins: [react(), backendNavigation()],
  server: { proxy, host: '127.0.0.1', fs: { deny: ['.env', '.env.*', '**/*.{crt,pem}', '**/.git/**', '**/.local-data/**', '**/backups/**', '**/server/**', '**/scripts/**', '**/mfa_codes.json'] } },
  preview: { proxy },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        mywealth: fileURLToPath(new URL('./mywealth.html', import.meta.url)),
        authentication: fileURLToPath(new URL('./authentication.html', import.meta.url)),
        connecting: fileURLToPath(new URL('./connecting.html', import.meta.url)),
        authenticationWait: fileURLToPath(new URL('./authentication-wait.html', import.meta.url)),
        authenticationSuccess: fileURLToPath(new URL('./authentication-success.html', import.meta.url)),
        mywealthLoading: fileURLToPath(new URL('./mywealth-loading.html', import.meta.url)),
        dashboard: fileURLToPath(new URL('./dashboard.html', import.meta.url)),
        accounts: fileURLToPath(new URL('./accounts.html', import.meta.url)),
        estateHub: fileURLToPath(new URL('./estate-hub.html', import.meta.url)),
        documents: fileURLToPath(new URL('./documents.html', import.meta.url)),
        transfers: fileURLToPath(new URL('./transfers.html', import.meta.url)),
        settings: fileURLToPath(new URL('./settings.html', import.meta.url)),
      },
    },
  },
})



