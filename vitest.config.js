import {
  defineConfig 
} from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.js'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['modules/**/*.js'],
      exclude: ['tests/**'],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
})
