import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // Im Production-Build (GitHub Pages) liegt die App unter /gymify/.
  // Lokal (dev) bleibt der Pfad auf / damit localhost:5173 normal funktioniert.
  base: command === 'build' ? '/gymify/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
}))
