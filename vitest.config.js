import {
  defineConfig 
} from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.js'],
    // Only this checkout's own tests. Git worktrees created under .claude/ are excluded from the
    // repository, but vitest still walked into them and ran another branch's tests against this
    // branch's setup file, so `npm run check` and the pre-push hook failed on work that was not
    // in the commit.
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['modules/**/*.js'],
      exclude: ['modules/sr5.js', 'modules/hooks/**'],
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
})
