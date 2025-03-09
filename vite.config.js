import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "./",
  publicDir: "public",
  server: {
    strictPort: true,
    port: 5173,
    // Allow serving files from one level up to the project root
    fs: {
      allow: [".."],
    },
  },
  build: {
    outDir: "public/dist",
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        app: resolve(__dirname, "resources/js/app.js"),
        css: resolve(__dirname, "resources/css/app.css"),
      },
    },
  },
  plugins: [tailwindcss()],
});
