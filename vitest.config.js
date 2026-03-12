import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // No unit tests yet — scripts/tests/ contains Foundry macro scripts that
    // require a live Foundry environment and cannot run in Node.js/vitest.
    // Set passWithNoTests so 'npm test' exits 0 until unit tests are added.
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['scripts/**/*.js'],
      exclude: ['scripts/tests/**'],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
})
