import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import globalcss from '@/styles/globals.css?url'

export interface RouterAppContext {
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: globalcss,
      },
    ],
    scripts: [
      {
        src: 'https://tweakcn.com/live-preview.min.js',
        crossOrigin: 'anonymous',
      },
    ],
  }),
  component: RootDocument
})

function RootDocument() {
  return (
    <html lang="en" className='rounded-md' suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className='flex flex-col bg-background h-screen'>
        <ThemeProvider
          attribute="class"
          enableSystem
          defaultTheme='system'
          disableTransitionOnChange
          themes={["light", "dark", "system"]}
        >
          <div className='flex-1'><Outlet /></div>
          <Toaster richColors />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
