import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig({
  plugins: [react(), stylex({ enableStylexExtend: true })]
})
