import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useTheme } from "./provider";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon, Sun } from "@hugeicons/core-free-icons";

export function UseThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <Button
            size="icon-xs"
            variant="default"
            onClick={toggleTheme}
            className={cn("rounded-full relative overflow-hidden")}
            aria-label="Toggle theme"
        >
            <HugeiconsIcon
                icon={Sun}
                className={cn(
                    "dualTone transition-all duration-300",
                    theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                )}
            />
            <HugeiconsIcon
                icon={Moon}
                className={cn(
                    "dualTone absolute transition-all duration-300",
                    theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                )}
            />
        </Button>
    );
}