import { useState } from "react"
import {
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import {
    UserAdd01Icon,
    Building01Icon,
    JusticeScaleIcon as JusticeHammerIcon,
    UserWarning01Icon as WarningDiamondIcon,
    UserShield01Icon,
    UserMultiple02Icon,
    ArrowMoveUpLeftFreeIcons as ArrowMoveLeftRight02Icon,
} from "@hugeicons/core-free-icons"

import { InmateForm } from "./inmate-form"
import { PrisonForm } from "./prison-form"
import { CourtForm } from "./court-form"
import { OfficerForm } from "./officer-form"
import { OffenseForm } from "./offense-form"
import { VisitorForm } from "./visitor-form"
import { MovementForm } from "./movement-form"
import { useSidebarContext } from "../management-provider/app-sidebar"

const CATEGORIES = [
    {
        id: "inmate" as const,
        label: "Inmate",
        icon: UserAdd01Icon,
        color: "text-rose-600",
        bg: "bg-rose-500/10",
        title: "Add new inmate",
        description: "Fill in the inmate's information and case details",
    },
    {
        id: "visitor" as const,
        label: "Visitor",
        icon: UserMultiple02Icon,
        color: "text-sky-600",
        bg: "bg-sky-500/10",
        title: "Schedule a visit",
        description: "Register a visitor and schedule their visit",
    },
    {
        id: "movement" as const,
        label: "Movement",
        icon: ArrowMoveLeftRight02Icon,
        color: "text-indigo-600",
        bg: "bg-indigo-500/10",
        title: "Record a movement",
        description: "Log a transfer, hospital visit, court escort or release",
    },
    {
        id: "officer" as const,
        label: "Officer",
        icon: UserShield01Icon,
        color: "text-teal-600",
        bg: "bg-teal-500/10",
        title: "Add new officer",
        description: "Register a prison officer or warden",
    },
    {
        id: "prison" as const,
        label: "Prison",
        icon: Building01Icon,
        color: "text-violet-600",
        bg: "bg-violet-500/10",
        title: "Add new prison",
        description: "Register a prison facility or branch",
    },
    {
        id: "court" as const,
        label: "Court",
        icon: JusticeHammerIcon,
        color: "text-blue-600",
        bg: "bg-blue-500/10",
        title: "Add new court",
        description: "Register a court for appearances",
    },
    {
        id: "offense" as const,
        label: "Offense",
        icon: WarningDiamondIcon,
        color: "text-amber-600",
        bg: "bg-amber-500/10",
        title: "Add new offense",
        description: "Register a chargeable offense",
    },
] as const

export type SheetCategory = typeof CATEGORIES[number]["id"]

const FORMS: Record<SheetCategory, React.ComponentType<{
    onDone: () => void
}>> = {
    inmate: InmateForm,
    visitor: VisitorForm,
    movement: MovementForm,
    officer: OfficerForm,
    prison: PrisonForm,
    court: CourtForm,
    offense: OffenseForm,
}

export function SheetApplication({
    defaultCategory = "inmate",
    onClose,
}: {
    defaultCategory?: SheetCategory
    onClose?: () => void
}) {
    const [active, setActive] = useState<SheetCategory>(defaultCategory)
    const ActiveForm = FORMS[active]
    const meta = CATEGORIES.find((c) => c.id === active)!
    const { sidebarClose } = useSidebarContext()

    return (
        <SheetContent className="md:min-w-2xl lg:min-w-3xl flex flex-col gap-0 p-0">
            <SheetHeader className="px-6 pt-6 pb-4 gap-0 border-b border-border/60">
                <div className="flex items-center gap-1 mb-3 flex-wrap">
                    {CATEGORIES.map((cat) => {
                        const isActive = cat.id === active
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActive(cat.id)}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                    isActive
                                        ? cn(cat.bg, cat.color, "ring-1 ring-inset ring-current/20")
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                <HugeiconsIcon icon={cat.icon} className="size-3.5" />
                                {cat.label}
                            </button>
                        )
                    })}
                </div>
                <SheetTitle className="font-bold text-lg">{meta.title}</SheetTitle>
                <SheetDescription>{meta.description}</SheetDescription>
            </SheetHeader>

            <div className="px-6 overflow-y-auto pt-5 pb-10 no-scrollbar flex-1">
                <ActiveForm
                    onDone={() => {
                        sidebarClose(false)
                        onClose?.()
                    }}
                />
            </div>
        </SheetContent>
    )
}