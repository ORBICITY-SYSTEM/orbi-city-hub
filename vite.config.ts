import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";


const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];

export default defineConfig({
  plugins,
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Optimize build performance
    target: 'es2020',
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // More aggressive code splitting to reduce bundle size
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@trpc') || id.includes('@tanstack')) {
              return 'trpc-vendor';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'chart-libs';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // Split other node_modules into smaller chunks
            return 'vendor';
          }
        },
      },
      // Increase max parallel file reads to prevent EMFILE errors
      maxParallelFileOps: 20,
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Minification
    minify: 'esbuild',
    // Source maps for production debugging
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Disable size reporting to save memory
    reportCompressedSize: false,
    // Reduce memory usage
    modulePreload: false,
    // Reduce memory usage during build
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      ".railway.app",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
