import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      include: /\/src\/.*\.(js|jsx)$/,
      jsxRuntime: "automatic",
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test/setup.js"],
    css: false,
    env: {
      VITE_API_URL: "/api/v1",
      VITE_ASSETS_URL: "http://localhost:8080",
    },
    exclude: configDefaults.exclude,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/test/**", "src/**/*.test.{js,jsx}", "src/main.jsx"],
      thresholds: {
        lines: 52,
        branches: 48,
        functions: 47,
        statements: 50,
      },
    },
  },
});
