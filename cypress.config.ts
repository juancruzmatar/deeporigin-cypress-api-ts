import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://dummyjson.com',
    specPattern: 'cypress/e2e/**/*.spec.ts',
    video: false,
    supportFile: 'cypress/support/e2e.ts',
    retries: 1,
  },
})
