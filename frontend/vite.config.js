import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // The backend (see server.js) listens on PORT=5000 by default.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
