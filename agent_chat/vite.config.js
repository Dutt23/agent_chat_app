import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',         // binds to the custom host
    port: 5173,                     // or whatever port you want
    allowedHosts: ['agent.chat.app'],
    https: {
      key: fs.readFileSync('../server.key'), // path to your key
      cert: fs.readFileSync('../server.crt'), // path to your cert
    },
    // allow requests for this host
  }
})
