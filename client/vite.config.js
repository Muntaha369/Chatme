import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    watch: {
      usePolling: true, // Often needed for Docker on Windows/WSL
    },
    host: true, // Check this matches the Docker flag
    strictPort: true,
    port: 5173, 
  },
  plugins: [
    tailwindcss(),
    react()],
})
