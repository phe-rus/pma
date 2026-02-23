import { ConvexProvider } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL

if (!CONVEX_URL) {
  throw new Error('Missing environment variable: VITE_CONVEX_URL')
}

const GLOBAL_KEY = '__convex_context__'
interface ConvexContext {
  convexQueryClient: ConvexQueryClient
  queryClient: QueryClient
  connected: boolean
}

function createConvexContext(): ConvexContext {
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        if (typeof window !== 'undefined') {
          toast.error(`Error: ${error.message}`)
        }
      },
    }),
  })

  return {
    convexQueryClient,
    queryClient,
    connected: false,
  }
}

export function getContext() {
  if (!(globalThis as any)[GLOBAL_KEY]) {
    (globalThis as any)[GLOBAL_KEY] = createConvexContext()
  }
  return (globalThis as any)[GLOBAL_KEY] as ConvexContext
}

export function connectConvexContext() {
  const ctx = getContext()
  if (!ctx.connected) {
    ctx.convexQueryClient.connect(ctx.queryClient)
    ctx.connected = true
  }
  return ctx
}

export default function AppConvexProvider({
  client,
  children,
}: {
  client: ConvexQueryClient
  children: React.ReactNode
}) {
  return (
    <ConvexProvider client={client.convexClient}>
      {children}
    </ConvexProvider>
  )
}