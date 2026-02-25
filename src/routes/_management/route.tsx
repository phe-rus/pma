import { AppSidebar } from '@/components/management-provider/app-sidebar'
import { TaskbarApp } from '@/components/taskbar-app'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_management')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <article className='flex flex-col'>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant='sidebar'>
          <SidebarInset className='rounded-r-lg rounded-l-none overflow-hidden'>
            <main className={cn(
              'relative flex flex-col overflow-y-scroll no-scrollbar h-svh scroll-smooth',
              "data-[variant=inset]:bg-sidebar"
            )}>
              <TaskbarApp />
              <div className='container flex-1'><Outlet /></div>
            </main>
          </SidebarInset>
        </AppSidebar>
      </SidebarProvider>
    </article>
  )
}
