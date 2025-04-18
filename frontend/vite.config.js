import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'all',
      '4d10-2001-ee0-53d5-f770-850b-e754-5a49-cbd6.ngrok-free.app'
    ]
  }
})