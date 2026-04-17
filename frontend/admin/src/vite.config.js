import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      // Custom allow replaces Vite defaults; include app root + shared code.
      allow: [
        __dirname,
        path.resolve(__dirname, '..', '..', 'shared'),
      ],
    },
  },
})
