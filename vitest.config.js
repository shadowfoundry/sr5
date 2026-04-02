import {
  defineConfig 
} from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      include: ['modules/**/*.js'],
      exclude: ['modules/sr5.js', 'modules/hooks/**'],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
})
