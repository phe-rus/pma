import { defineConfig } from "vite"
import viteCommonjsExternals from 'vite-plugin-commonjs-externals'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from 'node:url'
import { nitro } from 'nitro/vite'

// @ts-ignore
const host = process.env.TAURI_DEV_HOST;
export default defineConfig(async () => ({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    devtools(),
    viteCommonjsExternals({
      externals: ['use-sync-external-store'],
    }),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    react()
  ],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
    preset: 'static'
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    emptyOutDir: true,
    target: process.env.TAURI_ENV_PLATFORM == 'windows'
      ? 'chrome105'
      : 'safari13',
    sourcemap: !!process.env.TAURI_ENV_DEBUG
  }
}))
