import { Cancel01Icon, RectangularIcon, Remove01Icon } from "@hugeicons/core-free-icons";
import { getCurrentWindow, Window } from '@tauri-apps/api/window';
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarTrigger } from "./ui/sidebar";
import { useEffect, useState } from 'react';
import { Separator } from "./ui/separator";
import { Button } from './ui/button';
import { cn } from "@/lib/utils";
import { useIsTauri } from "@/lib/useIsTauri";
import { UseThemeSwitcher } from "./theme-provider";

export function TaskbarApp() {
    const [appWindow, setAppWindow] = useState<Window | null>(null)
    const [mounted, setMounted] = useState(false)
    const isTauri = useIsTauri()

    useEffect(() => {
        setMounted(true)
        if (isTauri) {
            setAppWindow(getCurrentWindow())
        }
    }, [])

    const minimize = () => appWindow?.minimize()
    const toggleMaximize = () => appWindow?.toggleMaximize()
    const close = () => appWindow?.close()

    if (!mounted) {
        return (
            <header className={cn(
                "sticky top-0 flex items-center z-55 justify-between h-8",
                'bg-sidebar border-b rounded-b-none rounded-tr-none rounded-tl-none',
                isTauri && "rounded-tr-lg"
            )}>
                <div className="px-5 flex w-full justify-between items-center h-fit">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-8" />
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header
            data-tauri-drag-region={isTauri ? true : undefined}
            className={cn(
                isTauri ? "cursor-pointer rounded-tr-lg" : "cursor-default rounded-tr-none",
                "sticky top-0 flex items-center z-50 justify-between h-8",
                'bg-sidebar border-b rounded-b-none rounded-tl-none'
            )}
            suppressHydrationWarning
        >
            <section
                data-tauri-drag-region={isTauri ? true : undefined}
                className="px-5 flex w-full justify-between items-center h-fit"
            >
                <div data-tauri-drag-region={isTauri ? true : undefined} className="flex gap-3 items-center">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="data-[orientation=vertical]:h-8"
                    />
                    <nav className="flex items-center gap-px">
                        <h1 className="text-xs font-medium">Documents</h1>
                    </nav>
                </div>

                {isTauri && (
                    <nav className="flex items-center gap-px">
                        <UseThemeSwitcher />
                        <Button
                            size="icon-xs"
                            variant="secondary"
                            onClick={minimize}
                            aria-label="Minimize window"
                        >
                            <HugeiconsIcon
                                icon={Remove01Icon}
                                strokeWidth={3}
                                className="dualTone"
                            />
                        </Button>
                        <Button
                            size="icon-xs"
                            variant="secondary"
                            onClick={toggleMaximize}
                            aria-label="Toggle maximize"
                        >
                            <HugeiconsIcon
                                icon={RectangularIcon}
                                strokeWidth={3}
                                className="dualTone"
                            />
                        </Button>
                        <Button
                            size="icon-xs"
                            onClick={close}
                            variant="destructive"
                            aria-label="Close window"
                        >
                            <HugeiconsIcon
                                icon={Cancel01Icon}
                                strokeWidth={3}
                                className="dualTone"
                            />
                        </Button>
                    </nav>
                )}
            </section>
        </header>
    );
}