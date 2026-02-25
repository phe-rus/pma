import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Runtime check for environment variable with helpful error message
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL

if (!CONVEX_URL) {
  const isProd = import.meta.env.PROD
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

  throw new Error(
    `Missing environment variable: VITE_CONVEX_URL\n\n` +
    `Current environment:\n` +
    `- Production: ${isProd}\n` +
    `- Tauri: ${isTauri}\n` +
    `- Mode: ${import.meta.env.MODE}\n\n` +
    `Please ensure VITE_CONVEX_URL is set in your .env file or environment variables.\n` +
    `Example: VITE_CONVEX_URL=https://your-deployment.convex.cloud/api`
  )
}

const GLOBAL_KEY = '__convex_context__' as const

interface ConvexContext {
  convexReactClient: ConvexReactClient  // Store the React client separately
  convexQueryClient: ConvexQueryClient
  queryClient: QueryClient
  connected: boolean
}

function createConvexContext(): ConvexContext {
  // Create the underlying React client first
  const convexReactClient = new ConvexReactClient(CONVEX_URL)

  // Pass it to ConvexQueryClient
  const convexQueryClient = new ConvexQueryClient(convexReactClient)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        // Add retry logic for better UX
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && error.message.includes('4')) {
            return false
          }
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (typeof window !== 'undefined') {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'

          // Only show toast for non-background queries
          if (query.meta?.showToast !== false) {
            toast.error(`Query failed: ${errorMessage}`, {
              id: `query-error-${query.queryKey.join('-')}`,
              duration: 5000,
            })
          }
        }
      },
    }),
  })

  return {
    convexReactClient,
    convexQueryClient,
    queryClient,
    connected: false,
  }
}

export function getConvexContext(): ConvexContext {
  const globalContext = (globalThis as Record<string, unknown>)[GLOBAL_KEY]

  if (!globalContext) {
    const newContext = createConvexContext()
      ; (globalThis as Record<string, unknown>)[GLOBAL_KEY] = newContext
    return newContext
  }

  return globalContext as ConvexContext
}

// Alias for backward compatibility
export const getContext = getConvexContext

export function connectConvexContext(): ConvexContext {
  const ctx = getConvexContext()

  if (!ctx.connected) {
    try {
      ctx.convexQueryClient.connect(ctx.queryClient)
      ctx.connected = true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect to Convex'
      toast.error(`Connection failed: ${message}`)
      throw error
    }
  }

  return ctx
}

// Fixed: Use convexReactClient.close() instead of convexQueryClient.close()
export async function disconnectConvexContext(): Promise<void> {
  const ctx = (globalThis as Record<string, unknown>)[GLOBAL_KEY] as ConvexContext | undefined

  if (ctx?.connected) {
    await ctx.convexReactClient.close()  // Close the underlying React client
    ctx.connected = false
  }
}

// Hook for React components
export function useConvexContext() {
  return getConvexContext()
}

// Provider component with proper typing
interface AppConvexProviderProps {
  client: ConvexReactClient  // Changed to ConvexReactClient
  children: React.ReactNode
}

export default function AppConvexProvider({
  client,
  children,
}: AppConvexProviderProps) {
  return (
    <ConvexProvider client={client}>
      {children}
    </ConvexProvider>
  )
}

// Utility to check if context is ready
export function isConvexConnected(): boolean {
  const ctx = (globalThis as Record<string, unknown>)[GLOBAL_KEY] as ConvexContext | undefined
  return ctx?.connected ?? false
}