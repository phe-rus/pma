import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { Monitor, Moon, Sun } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/_management/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { theme, setTheme } = useTheme()
  const listTheme = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: Moon
    },
    {
      value: 'system',
      label: 'System',
      icon: Monitor
    },
  ]

  const getStorageAndCacheUsage = useMemo(() => {
    return ["hello", "world"]
  }, [])

  return (
    <article className="flex flex-col gap-5 py-5 md:max-w-5xl w-full mx-auto">
      <section className='flex flex-col gap-5'>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your account settings
          </p>
        </div>

        <div className='flex flex-col gap-5'>
          <h2 className="text-lg font-semibold">Theming settings</h2>
          <div className="flex items-center gap-2">
            {listTheme.map((item) => (
              <div
                key={item.value}
                className={cn(
                  "flex items-center gap-2 bg-card rounded-md p-2 cursor-pointer",
                  theme === item.value && "bg-primary text-primary-foreground",
                  'border border-dashed'
                )}
                onClick={() => setTheme(item.value)}
              >
                <HugeiconsIcon icon={item.icon} className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-5'>
          <h2 className="text-lg font-semibold">Storage settings</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-card rounded-md p-2 cursor-pointer">
              <span className="text-sm">{getStorageAndCacheUsage}</span>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
