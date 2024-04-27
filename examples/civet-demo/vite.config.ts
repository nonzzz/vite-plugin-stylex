import civetPlugin from '@danielx/civet/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { stylex } from 'vite-plugin-stylex-dev'

export default defineConfig({
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat', // Must be below test-utils
      'react/jsx-runtime': 'preact/jsx-runtime'
    }
  },
  // Fixme @stylexjs/stylex don't respect `runtimeInjection` so we should set `dev` as false
  plugins: [civetPlugin({ implicitExtension: false }), react(), stylex({ include: /\.(mjs|js|ts|civet|jsx|tsx)(\?.*|)$/, dev: false })]
})
