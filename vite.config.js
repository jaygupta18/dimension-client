import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  outDir: 'dist',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://dimension-server-bckr.onrender.com',
        changeOrigin: true
      }
    }
  }
})

