// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist", // デフォルトだが明示
    emptyOutDir: true,
  },
});
