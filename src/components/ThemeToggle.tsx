import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
interface ThemeToggleProps {
  className?: string;
}
export function ThemeToggle({ className = "absolute top-4 right-4" }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className={`${className} hover:scale-110 hover:rotate-12 transition-all duration-300 active:scale-95 z-50 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-peach/10 shadow-sm group`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <div className="relative w-5 h-5">
        {isDark ? (
          <Sun className="h-5 w-5 text-yellow-400 transition-all duration-500 rotate-0 scale-100" />
        ) : (
          <Moon className="h-5 w-5 text-peach transition-all duration-500 rotate-0 scale-100" />
        )}
      </div>
    </Button>
  );
}