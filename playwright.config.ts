import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'
import { createRequire } from 'node:module';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// playwright is not running with vite, using dotenv:
const require = createRequire(import.meta.url)
require('dotenv').config({path: '.env.e2e'});

export const STORAGE_USER_STATE = './playwright/.cache/.auth/user.json'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Only on CI systems run the tests headless */
    headless: !!process.env.CI
  },

  /* Configure projects for major browsers */
  projects: [
    {
      // setup for logged in tests
      name: 'login setup',
      testMatch: '**/*login.setup.ts'
    },
    {
      // setup for files uploaded tests
      name: 'files uploaded setup',
      testMatch: '**/*-upload.setup.ts',
      dependencies: ['login setup'],
      use: {
        storageState: STORAGE_USER_STATE
      }
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },

    {
      name: 'e2e tests logged in',
      testMatch: '**/loggedIn/*.spec.ts',
      dependencies: ['files uploaded setup'],
      use: { storageState: STORAGE_USER_STATE }
    },
    {
      name: 'teardown after test runs',
      testMatch: '**/*.teardown.ts',
      dependencies: ['e2e tests logged in'],
      use: {
        storageState: STORAGE_USER_STATE
      }
    },
    {
      // separat teardown to run after failed tests for cleanup
      name: 'teardown',
      testMatch: '**/*.teardown.ts',
      dependencies: [],
      use: {
        storageState: STORAGE_USER_STATE
      }
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    /**
     * Use the dev server by default for faster feedback loop.
     * Use the preview server on CI for more realistic testing.
     * Playwright will re-use the local server if there is already a dev-server running.
     */
    command: process.env.CI ? 'vite preview --port 5173' : 'vite dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
})
