import { createRouter as createTanStackRouter, useNavigate } from '@tanstack/react-router'
import AppConvexProvider, { connectConvexContext } from "./integrations/convex/provider"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { FileNotFoundIcon, Loading03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { routeTree } from './routeTree.gen'

import { Button } from "./components/ui/button"
import "@/styles/globals.css"

export function getRouter() {
  const { queryClient, convexQueryClient } = connectConvexContext()
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: () => {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col text-center items-center justify-center gap-2">
            <HugeiconsIcon
              icon={Loading03Icon}
              className="size-12 dualTone animate-spin"
            />
            <p className="text-base font-bold tracking-tight">Loading...</p>
          </div>
        </div>
      )
    },
    defaultNotFoundComponent: () => {
      const navigate = useNavigate()
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center justify-center gap-4">
            <HugeiconsIcon
              icon={FileNotFoundIcon}
              strokeWidth={3}
              className="size-12 dualTone"
            />
            <p className="text-base font-bold tracking-tight">Not Found</p>
            <Button onClick={() => navigate({ to: '/' })}>
              Go Back
            </Button>
          </div>
        </div>
      )
    },
    context: {
      queryClient,
      convexQueryClient
    },
    Wrap: ({ children }) => {
      return (
        <AppConvexProvider client={convexQueryClient}>
          {children}
        </AppConvexProvider>
      )
    }
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}