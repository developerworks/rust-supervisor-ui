import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certificateDir = path.join(__dirname, "tests", "three-end", "certs");

export default defineConfig({
  testDir: "./tests/three-end/specs",
  testMatch: ["**/*.spec.ts"],
  timeout: 60_000,
  expect: {
    timeout: 15_000
  },
  use: {
    baseURL: "http://127.0.0.1:4174",
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
    clientCertificates: [
      {
        origin: "https://localhost:9443",
        certPath: path.join(certificateDir, "operator.crt"),
        keyPath: path.join(certificateDir, "operator.key")
      }
    ]
  },
  webServer: [
    {
      command: "node tests/three-end/support/three-end-harness.mjs",
      url: "http://127.0.0.1:39551/health",
      reuseExistingServer: false,
      timeout: 180_000,
      gracefulShutdown: { signal: "SIGTERM", timeout: 2_000 }
    },
    {
      command:
        "VITE_SUPERVISOR_RELAY_URL=wss://localhost:9443/supervisor npm run preview -- --host 127.0.0.1 --port 4174",
      url: "http://127.0.0.1:4174",
      reuseExistingServer: false,
      timeout: 120_000,
      gracefulShutdown: { signal: "SIGTERM", timeout: 2_000 }
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
