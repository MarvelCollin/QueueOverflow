import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST || '0.0.0.0';

export default defineConfig(async () => ({
  plugins: [react()],

  clearScreen: false,
  server: {
    port: process.env.NODE_ENV === 'production' ? 3333 : 3001,
    strictPort: true,
    host: host,
    hmr: {
      host: 'localhost',
      port: 3002,
    },
    watch: {
      ignored: ["**/src-tauri/**"],
    },
    proxy: {},
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1600,
  }
}));
