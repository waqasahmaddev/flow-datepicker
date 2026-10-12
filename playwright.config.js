import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.TEST_PORT) || 5281;
const mobileOnly = /mobile.*\.spec\.js/;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  expect: { timeout: 5000 },
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node scripts/serve.mjs',
    env: { PORT: String(port) },
    url: `http://localhost:${port}/demo/`,
    reuseExistingServer: true
  },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' }, testIgnore: mobileOnly },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testIgnore: mobileOnly },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: mobileOnly, grep: /@basic/ },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'], channel: 'chrome' }, testMatch: mobileOnly },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] }, testMatch: mobileOnly, grep: /@basic/ }
  ]
});
