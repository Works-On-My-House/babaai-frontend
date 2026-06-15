import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    env: {
      VITE_API_BASE_URL: "http://localhost:8000",
      VITE_INGREDIENT_PAGE_SIZE: "12",
      VITE_RECIPE_CATALOG_PAGE_SIZE: "6",
      VITE_SUGGESTIONS_PAGE_SIZE: "4",
      VITE_HISTORY_PAGE_SIZE: "12",
      VITE_DEFAULT_MIN_MATCH_PERCENT: "50",
    },
  },
});
