import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        companyInput: resolve(__dirname, 'company-input.html'),
        settings: resolve(__dirname, 'settings.html'),
      },
    },
  },
})
