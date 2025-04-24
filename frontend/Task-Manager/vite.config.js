import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'window',
    'process.env': {},
    'process.version': JSON.stringify('18.0.0'),
    'process.platform': JSON.stringify('browser'),
    'process.browser': true,
  },
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: "util",
      buffer: "buffer",
      events: "events",
      crypto: "crypto-browserify",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify/browser",
      path: "path-browserify",
      assert: "assert",
    },
  },
  optimizeDeps: {
    include: [
      'simple-peer',
      'process',
      'stream-browserify',
      'util',
      'buffer',
      'events',
      'crypto-browserify',
      'stream-http',
      'https-browserify',
      'os-browserify',
      'path-browserify',
      'assert'
    ],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});