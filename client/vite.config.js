import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    open: true,
    allowedHosts: ['2542-2405-201-680f-1ad5-14ff-b306-d2f1-66dd.ngrok-free.app', '5672-2405-201-680f-1ad5-14ff-b306-d2f1-66dd.ngrok-free.app']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  logLevel: 'info'
})
