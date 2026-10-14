import { defineConfig } from 'vitest/config'

// Pin a non-UTC zone so date helpers are exercised against a real offset (Peru, UTC-5).
process.env.TZ = 'America/Lima'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['fake-indexeddb/auto'],
  },
})
