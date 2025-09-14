import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls starting with /api/saavn to JioSaavn to avoid CORS during development
      '/api/saavn': {
        target: 'https://www.jiosaavn.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/saavn/, ''),
      },
      // Proxy playlist-songs requests to the configured backend (local dev -> remote service)
      '/api/playlist-songs': (() => {
        const raw = (globalThis.process && globalThis.process.env && globalThis.process.env.PLAYLIST_SONGS_URL) || '';
        if (!raw) return {
          target: 'http://localhost:5173',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api\/playlist-songs/, '/playlist-data'),
        };
        try {
          const u = new URL(raw);
          const origin = u.origin;
          const basePath = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '');
          return {
            target: origin,
            changeOrigin: true,
            secure: true,
            rewrite: (p) => p.replace(/^\/api\/playlist-songs/, basePath),
          };
        } catch {
          return {
            target: raw || 'http://localhost:5173',
            changeOrigin: true,
            secure: false,
          };
        }
      })(),
    }
  },
})
