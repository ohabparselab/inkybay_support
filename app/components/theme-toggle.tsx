// app/components/theme-toggle.tsx
import { Moon, Sun } from "lucide-react";
import { Theme, useTheme } from "remix-themes";
import { Button } from "./ui/button";

export function ThemeToggle() {
    const [currentTheme, setTheme] = useTheme();

    const toggleTheme = () => {
        if (currentTheme === Theme.DARK) {
            setTheme(Theme.LIGHT);
        } else {
            setTheme(Theme.DARK);
        }
    };

    return (
        <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={toggleTheme}
        >
            <Sun
                className={`h-[1.2rem] w-[1.2rem] transition-all ${currentTheme === Theme.LIGHT
                        ? "scale-100 rotate-0"
                        : "scale-0 -rotate-90"
                    }`}
            />
            <Moon
                className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${currentTheme === Theme.DARK
                        ? "scale-100 rotate-0"
                        : "scale-0 rotate-90"
                    }`}
            />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
