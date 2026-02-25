import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { Building01Icon, DocumentCodeIcon, GuestHouseIcon, Home01Icon, JusticeScale02Icon, MoveBottomIcon, Plus, PoliceBadgeIcon, PrisonGuardIcon, Settings, UserWarning01Icon, VersusIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import { AppSidebarProps } from "./types";
import { cn } from "@/lib/utils"
import { createContext, useContext, useState } from "react";
import { Sheet, SheetTrigger } from "../ui/sheet";
import { SheetApplication } from "../management-forms/sheet-application";
import { LinkOptions, useLocation, useNavigate } from "@tanstack/react-router";
import { useIsTauri } from "@/lib/useIsTauri";

type SidebarContextType = {
    sidebarOpen: boolean;
    sidebarClose: (v: boolean) => void;
} | null;

type MenuItemsTypes = {
    title: string;
    icon: IconSvgElement;
    to: LinkOptions["to"];
}

export const SidebarContext = createContext<SidebarContextType>(null)
export const useSidebarContext = () => {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebarContext must be used within a SidebarProvider")
    }
    return context
}

export function AppSidebar({ children, ...props }: AppSidebarProps) {
    const [openSheet, setOpenSheet] = useState(false)
    const isTauri = useIsTauri()
    const navigation = useNavigate()
    const location = useLocation()

    const isActive = (path: string) => {
        if (path === "/") return location.pathname === "/"
        return location.pathname.startsWith(path)
    }

    const menuItems: MenuItemsTypes[] = [
        {
            title: "System Overview",
            icon: Home01Icon,
            to: '/'
        },
        {
            title: 'Inmate Management',
            icon: PrisonGuardIcon,
            to: '/inmates'
        },
        {
            title: 'Visit Management',
            icon: GuestHouseIcon,
            to: '/visits'
        },
        {
            title: 'Officers Management',
            icon: Building01Icon,
            to: '/officers'
        },
        {
            title: 'Prisons & Facilities',
            icon: PoliceBadgeIcon,
            to: '/prisons'
        },
        {
            title: 'Movement Records',
            icon: MoveBottomIcon,
            to: '/movements'
        },
        {
            title: 'Offenses',
            icon: UserWarning01Icon,
            to: '/offenses'
        },
        {
            title: 'Courts & Appearances',
            icon: JusticeScale02Icon,
            to: '/courts'
        }
    ]
    const footerItems: MenuItemsTypes[] = [
        {
            title: 'Documentations',
            icon: DocumentCodeIcon,
            to: '/documentations'
        },
        {
            title: 'Settings',
            icon: Settings,
            to: '/settings'
        }
    ]

    return (
        <SidebarContext value={{
            sidebarOpen: openSheet,
            sidebarClose: setOpenSheet
        }}>
            <Sheet
                open={openSheet}
                onOpenChange={() => setOpenSheet(!openSheet)}
            >
                <Sidebar
                    data-tauri-drag-region
                    collapsible="icon"
                    {...props}
                    suppressHydrationWarning
                    className={cn(
                        "px-2 rounded-r-none p-0 overflow-hidden",
                        isTauri ? "rounded-l-lg border-l-0" : "rounded-l-none",
                        props.className
                    )}
                >
                    <SidebarHeader data-tauri-drag-region>
                        <SidebarMenu data-tauri-drag-region>
                            <SidebarMenuItem data-tauri-drag-region>
                                <SidebarMenuButton
                                    data-tauri-drag-region
                                    className={cn(
                                        'flex gap-3 items-center',
                                        "data-[slot=sidebar-menu-button]:rounded-none",
                                        "data-[slot=sidebar-menu-button]:cursor-default",
                                        "data-[slot=sidebar-menu-button]:hover:bg-transparent"
                                    )}
                                >
                                    <HugeiconsIcon icon={PrisonGuardIcon} className="size-4! dualTone" />
                                    <span data-tauri-drag-region className="text-sm">Prison Management System.</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent className="flex flex-col gap-2">
                                <SidebarMenu>
                                    <SheetTrigger
                                        nativeButton={false}
                                        render={
                                            <SidebarMenuItem className="flex items-center gap-2">
                                                <SidebarMenuButton
                                                    tooltip="Create new inmate"
                                                    variant='default'
                                                    onClick={() => setOpenSheet(!openSheet)}
                                                    className={cn(
                                                        'flex gap-3 items-center data-[slot=sidebar-menu-button]:bg-primary/15',
                                                        "data-[slot=sidebar-menu-button]:text-secondary-foreground data-[slot=sidebar-menu-button]:py-5",
                                                        "data-[slot=sidebar-menu-button]:cursor-default data-[slot=sidebar-menu-button]:w-fit",
                                                        'data-[slot=sidebar-menu-button]:hover:bg-primary/10 data-[slot=sidebar-menu-button]:hover:text-secondary-foreground',
                                                        'data-[slot=sidebar-menu-button]:rounded-full'
                                                    )}
                                                >
                                                    <HugeiconsIcon icon={Plus} className="size-4! dualTone" />
                                                    <span className="text-sm font-bold pr-3">New inmate</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        }
                                    />
                                </SidebarMenu>

                                <SidebarMenu>
                                    {menuItems?.map((item, index) => (
                                        <SidebarMenuItem key={index}>
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                onClick={() => navigation({
                                                    to: item.to as any,
                                                    replace: true
                                                })}
                                                isActive={isActive(item.to as any)}
                                                className={cn(
                                                    'flex gap-3 items-center',
                                                    "data-[slot=sidebar-menu-button]:cursor-pointer"
                                                )}
                                            >
                                                {item.icon &&
                                                    <HugeiconsIcon icon={item.icon} className="size-4! dualTone" />
                                                }
                                                <span className="text-sm text-muted-foreground">{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter>
                        <SidebarMenu className="gap-2">
                            {footerItems?.map((item, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={true}
                                        className={cn(
                                            'flex gap-5 items-center w-fit',
                                            "data-[slot=sidebar-menu-button]:cursor-pointer",
                                            "data-[slot=sidebar-menu-button]:rounded-full"
                                        )}
                                        onClick={() => navigation({
                                            to: item.to,
                                            replace: true
                                        })}
                                    >
                                        {item.icon &&
                                            <HugeiconsIcon icon={item.icon} className="size-4! dualTone" />
                                        }
                                        <span className="text-xs text-muted-foreground">{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip="Settings"
                                    isActive={true}
                                    className={cn(
                                        'flex gap-5 items-center w-fit',
                                        "data-[slot=sidebar-menu-button]:cursor-pointer",
                                        "data-[slot=sidebar-menu-button]:rounded-full"
                                    )}
                                >
                                    <HugeiconsIcon icon={VersusIcon} className="size-4! dualTone" />
                                    <span className="flex gap-3 text-xs items-center justify-between w-full">Version
                                        <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">Beta 1.0.0</span>
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>
                <SheetApplication
                    onClose={() => setOpenSheet(false)}
                    defaultCategory="inmate"
                />
            </Sheet>
            <>{children}</>
        </SidebarContext>
    )
}