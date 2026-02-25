import { useTheme } from '@/components/theme-provider'
import { useIsTauri } from '@/lib/useIsTauri'
import { cn } from '@/lib/utils'
import {
  Cpu,
  HardDrive,
  Monitor,
  Moon,
  Sun,
  Refresh01Icon as RefreshDot,
  Package01Icon as PackageInfo,
  Tick01Icon as Tick02
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// Tauri v2 Plugin Imports
import { platform, version as osVersion, arch, hostname, type as osType } from '@tauri-apps/plugin-os'
import { getVersion } from '@tauri-apps/api/app'
import { check, type Update } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

export const Route = createFileRoute('/_management/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { theme, setTheme } = useTheme()
  const isTauri = useIsTauri()

  // State
  const [sysInfo, setSysInfo] = useState<any>(null)
  const [appVersion, setAppVersion] = useState<string>('')
  const [updateInfo, setUpdateInfo] = useState<Update | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const listTheme = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  // Initialize System and App Info
  useEffect(() => {
    if (isTauri) {
      const init = async () => {
        try {
          setSysInfo({
            os: platform(),
            ver: osVersion(),
            architecture: arch(),
            name: hostname(),
            type: osType()
          })
          setAppVersion(await getVersion())

          // Silent background check on mount
          const update = await check()
          if (update?.available) setUpdateInfo(update)
        } catch (e) {
          console.error("Tauri initialization error:", e)
        }
      }
      init()
    }
  }, [isTauri])

  const handleUpdateCheck = async () => {
    if (!isTauri) return
    setIsChecking(true)
    try {
      const update = await check()
      if (update?.available) {
        setUpdateInfo(update)
        toast.success(`Version ${update.version} is available!`)
      } else {
        toast.info("You're on the latest version.")
      }
    } catch (e) {
      toast.error("Failed to check for updates.")
    } finally {
      setIsChecking(false)
    }
  }

  const handleInstall = async () => {
    if (!updateInfo) return
    try {
      toast.info("Downloading update... App will restart automatically.")
      await updateInfo.downloadAndInstall()
      await relaunch()
    } catch (e) {
      toast.error("Installation failed.")
    }
  }

  return (
    <article className="flex flex-col gap-8 py-5 md:max-w-5xl w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage Pherus PMA and system preferences</p>
      </div>

      {/* 1. Application & Update Section */}
      <section className='flex flex-col gap-4'>
        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">Application</h3>
        <div className="bg-card border border-dashed p-5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <HugeiconsIcon icon={PackageInfo} className="text-primary dualTone" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold">Pherus PMA</p>
              <p className="text-xs font-mono text-muted-foreground">Current: v{appVersion || '0.0.0'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {updateInfo ? (
              <button
                onClick={handleInstall}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold animate-pulse"
              >
                <HugeiconsIcon icon={RefreshDot} size={18} className="dualTone" />
                Update to v{updateInfo.version}
              </button>
            ) : (
              <button
                onClick={handleUpdateCheck}
                disabled={isChecking}
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors disabled:opacity-50"
              >
                {isChecking ? (
                  <HugeiconsIcon icon={RefreshDot} size={18} className="animate-spin dualTone" />
                ) : (
                  <HugeiconsIcon icon={Tick02} size={18} className="text-green-500 dualTone" />
                )}
                {isChecking ? "Checking..." : "Check for updates"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. System Specifications */}
      <section className='flex flex-col gap-4'>
        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">System Info</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-start gap-3 bg-card border border-dashed p-4 rounded-lg w-full md:max-w-3xs">
            <HugeiconsIcon icon={Cpu} className="text-primary mt-1 dualTone" size={20} />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold">Operating System</p>
              <p className="text-sm font-mono capitalize">{sysInfo?.os || 'Browser'} ({sysInfo?.type})</p>
              <p className="text-xs text-muted-foreground">{sysInfo?.ver}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-card border border-dashed p-4 rounded-lg w-full md:max-w-3xs">
            <HugeiconsIcon icon={Monitor} className="text-primary mt-1 dualTone" size={20} />
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold">Hardware</p>
              <p className="text-sm font-mono">{sysInfo?.architecture || 'Unknown Arch'}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{sysInfo?.name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Theming */}
      <section className='flex flex-col gap-4'>
        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">Appearance</h3>
        <div className="flex flex-wrap items-center gap-2">
          {listTheme.map((item) => (
            <div
              key={item.value}
              className={cn(
                "flex w-fit items-center justify-center gap-2 bg-card rounded-lg p-3 cursor-pointer border border-dashed transition-all",
                theme === item.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
              )}
              onClick={() => setTheme(item.value)}
            >
              <HugeiconsIcon icon={item.icon} className="w-5 h-5 dualTone" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Storage */}
      <section className='flex flex-col gap-4'>
        <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">Storage</h3>
        <div className="bg-card border border-dashed p-4 rounded-lg flex items-center justify-between w-full md:max-w-lg">
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={HardDrive} size={20} className="text-primary dualTone" />
            <span className="text-sm text-muted-foreground italic truncate">
              Local database is stored at %APPDATA%/PherusPMA
            </span>
          </div>
          <button className="text-xs font-bold text-destructive hover:underline px-2">
            Clear Cache
          </button>
        </div>
      </section>
    </article>
  )
}