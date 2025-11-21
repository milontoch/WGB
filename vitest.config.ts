// Vitest configuration
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: "jsdom",

    // Setup files
    setupFiles: ["./tests/setup.ts"],

    // Global test utilities
    globals: true,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "tests/",
        ".next/",
        "coverage/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/**",
        "scripts/",
      ],
      // Minimum coverage thresholds
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },

    // Test match patterns
    include: ["tests/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporter
    reporter: process.env.CI ? ["junit", "json", "verbose"] : ["verbose"],
    outputFile: {
      junit: "./test-results/junit.xml",
      json: "./test-results/results.json",
    },

    // Mock reset
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./tests"),
    },
  },
});
