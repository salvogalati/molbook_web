import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["primeract"]
  },
  server: {
    allowedHosts: true,
    //     https: {
    //   key: fs.readFileSync('./cert/key.pem'),
    //   cert: fs.readFileSync('./cert/cert.pem'),
    // },
  },
})
