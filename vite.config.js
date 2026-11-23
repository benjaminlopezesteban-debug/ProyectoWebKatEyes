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
    exclude: [...configDefaults.exclude, "src/App.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.test.{js,jsx}",
        "src/main.jsx",
        "src/index.js",
        "src/App.js",
        "src/reportWebVitals.js",
        "src/setupTests.js",
      ],
      thresholds: {
        lines: 21,
        branches: 28,
        functions: 22,
        statements: 21,
      },
    },
  },
});
