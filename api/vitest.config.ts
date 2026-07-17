import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? ''
    }
  }
})