import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5174 },
  // three.js is one lazy chunk (~150 kB gzipped) by design; don't warn about it.
  build: { chunkSizeWarningLimit: 700 },
});
