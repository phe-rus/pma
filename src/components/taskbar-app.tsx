import { ArrowRight01Icon, Cancel01Icon, RectangularIcon, Remove01Icon } from "@hugeicons/core-free-icons";
import { getCurrentWindow, type Window } from '@tauri-apps/api/window';
import { UseThemeSwitcher } from "./theme-provider";
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarTrigger } from "./ui/sidebar";
import { useIsTauri } from "@/lib/useIsTauri";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Separator } from "./ui/separator";
import { Button } from './ui/button';
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

export function TaskbarApp() {
    const [appWindow, setAppWindow] = useState<Window | null>(null);
    const pathname = useLocation({ select: (ctx) => ctx.pathname });
    const [mounted, setMounted] = useState(false);
    const isTauri = useIsTauri();

    const breadcrumbs = useMemo(() => {
        const pathSegments = pathname.split('/').filter(Boolean);
        return [
            { label: 'system-overview', href: '/', isLast: pathSegments.length === 0 },
            ...pathSegments.map((segment, index) => ({
                label: segment,
                href: `/${pathSegments.slice(0, index + 1).join('/')}`,
                isLast: index === pathSegments.length - 1,
            })),
        ];
    }, [pathname]);

    useEffect(() => {
        let isActive = true;

        if (isTauri && isActive) {
            try {
                const win = getCurrentWindow();
                if (isActive) {
                    setAppWindow(win);
                }
            } catch (error) {
                console.error('Failed to get Tauri window:', error);
            }
        }

        setMounted(true);

        return () => {
            isActive = false;
        };
    }, [isTauri]);

    const minimize = useCallback(() => {
        appWindow?.minimize().catch((e) => toast.error(e));
    }, [appWindow]);

    const toggleMaximize = useCallback(() => {
        appWindow?.toggleMaximize().catch((e) => toast.error(e));
    }, [appWindow]);

    const close = useCallback(() => {
        appWindow?.close().catch((e) => toast.error(e));
    }, [appWindow]);

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
            </header >
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
                        <h1 className="flex items-center gap-1 text-xs font-medium">
                            {breadcrumbs.map((crumb) => (
                                <div key={crumb.href} className="flex items-center gap-1">
                                    <Badge
                                        variant={crumb.isLast ? 'default' : 'secondary'}
                                        className="rounded"
                                    >
                                        <Link
                                            to={crumb.href}
                                            disabled={crumb.isLast}
                                            className={cn(
                                                "no-underline",
                                                crumb.isLast ? "cursor-default" : "hover:underline cursor-pointer"
                                            )}
                                        >
                                            {crumb.label}
                                        </Link>
                                    </Badge>

                                    {!crumb.isLast && (
                                        <HugeiconsIcon
                                            icon={ArrowRight01Icon}
                                            className="size-3 text-zinc-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </h1>
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
                            className='cursor-pointer'
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
                            className='cursor-pointer'
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
                            className='cursor-pointer'
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
    )
}