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
    }
  },
})
