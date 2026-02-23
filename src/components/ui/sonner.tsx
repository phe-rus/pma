import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "../theme-provider"
import { HugeiconsIcon } from "@hugeicons/react"
import { Check, Info, Loading03Icon, RssErrorIcon, Warning } from "@hugeicons/core-free-icons"

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            icons={{
                success: (
                    <HugeiconsIcon icon={Check} className="size-4 dualTone" />
                ),
                info: (
                    <HugeiconsIcon icon={Info} className="size-4 dualTone" />
                ),
                warning: (
                    <HugeiconsIcon icon={Warning} className="size-4 dualTone" />
                ),
                error: (
                    <HugeiconsIcon icon={RssErrorIcon} className="size-4 dualTone" />
                ),
                loading: (
                    <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin dualTone" />
                ),
            }}
            style={
                {
                    "--normal-bg": "var(--popover)",
                    "--normal-text": "var(--popover-foreground)",
                    "--normal-border": "var(--border)",
                    "--border-radius": "var(--radius)",
                } as React.CSSProperties
            }
            toastOptions={{
                classNames: {
                    toast: "cn-toast",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
