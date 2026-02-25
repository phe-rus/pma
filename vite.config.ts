import { defineConfig } from "vite"
import viteCommonjsExternals from 'vite-plugin-commonjs-externals'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from 'node:url'
import { nitro } from 'nitro/vite'

type TanStackStartInputConfig = NonNullable<
  Parameters<typeof tanstackStart>[0]
>;
type SpaOptions = NonNullable<TanStackStartInputConfig["spa"]>;
type SpaPrerenderOptions = NonNullable<SpaOptions["prerender"]>;
type RegularPrerenderOptions = NonNullable<SpaOptions["prerender"]>;

const host: string | undefined = process.env.TAURI_DEV_HOST;

// Read from environment variable to pick which prerender mode to use.
// Defaults to false, which will pick the SPA prerender mode
const useSsrPrerenderString: string =
  process.env.USE_SSR_PRERENDER_MODE?.toLowerCase() ?? "false";
const useSsrPrerenderMode: boolean =
  useSsrPrerenderString === "true" || useSsrPrerenderString === "1";

const sharedPrerenderOptions: SpaPrerenderOptions & RegularPrerenderOptions = {
  enabled: true,
  autoSubfolderIndex: true,
};

// See: https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode#prerendering-options
const regularPrerenderOptions: RegularPrerenderOptions = {
  ...sharedPrerenderOptions,
  // Whether to extract links from the HTML and prerender them also
  // See: https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering#crawling-links
  crawlLinks: true,
  // Number of times to retry a failed prerender job
  retryCount: 3,
  // Delay between retries in milliseconds
  retryDelay: 1000,
};

// See: https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode#prerendering-options
const spaWithPrerenderOptions: SpaOptions = {
  prerender: {
    ...sharedPrerenderOptions,
    // Change the root output path for SPA prerendering from /_shell.html to /index.html
    outputPath: "/index.html",
    crawlLinks: false,
    retryCount: 0,
  },
};
// @ts-ignore
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
    tanstackStart({
      spa: (!useSsrPrerenderMode
        ? spaWithPrerenderOptions
        : undefined) satisfies SpaOptions | undefined,
      prerender: (useSsrPrerenderMode
        ? regularPrerenderOptions
        : undefined) satisfies RegularPrerenderOptions | undefined,
    }),
    react()
  ],
  clearScreen: false,
  server: {
    port: 3000,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 3001,
      }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    }
  },
  /** define: {
    'process.env.CONVEX_DEPLOYMENT': JSON.stringify(process.env.CONVEX_DEPLOYMENT),
    'process.env.VITE_CONVEX_URL': JSON.stringify(process.env.VITE_CONVEX_URL),
    'process.env.VITE_CONVEX_SITE_URL': JSON.stringify(process.env.VITE_CONVEX_SITE_URL),
    'process.env.USE_SSR_PRERENDER_MODE': JSON.stringify(process.env.USE_SSR_PRERENDER_MODE),
    'process.env.TAURI_DEV_HOST': JSON.stringify(process.env.TAURI_DEV_HOST),
  } **/
}))
