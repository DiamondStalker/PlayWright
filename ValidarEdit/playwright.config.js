// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const dir = "C:/Users/Talent/AppData/Local/Google/Chrome/User Data/Default";
const chromeProfilePath = "C:/Users/Talent/AppData/Local/Google/Chrome/User Data/Default";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
// @ts-ignore
module.exports = defineConfig({

  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  /*use: {
    trace: 'on-first-retry',
  },
*/
  /* Configure projects for major browsers */

  use: {
    trace: 'only-on-failure',
    video: 'only-on-failure',
    launchOptions: {
      slowMo: 500
    },
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

