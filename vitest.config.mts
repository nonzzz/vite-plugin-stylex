import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watch: false,
    silent: true,
    coverage: {
      enabled: true,
      reporter: ['text', 'json', 'html'],
      include: ['src/**'],
      exclude: ['**/node_modules/**', '**/dist/**', 'src/**/interface.ts']
    }
  }
})
