import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: "/", // important for routing
  server: {
    host: "::",
    port: 8000,
    historyApiFallback: true, // ensures proper routing in development
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist", // optional, default is 'dist'
    emptyOutDir: true, // ensures the output directory is cleaned before building
  },
}));
