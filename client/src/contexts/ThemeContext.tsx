import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type FontScale = "sm" | "md" | "lg";
interface ThemeContextType { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme?: () => void; switchable: boolean; reducedMotion: boolean; setReducedMotion: (value: boolean) => void; highContrast: boolean; setHighContrast: (value: boolean) => void; fontScale: FontScale; setFontScale: (value: FontScale) => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
interface ThemeProviderProps { children: React.ReactNode; defaultTheme?: Theme; switchable?: boolean; }

export function ThemeProvider({ children, defaultTheme = "light", switchable = false }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => switchable ? ((localStorage.getItem("theme") as Theme) || defaultTheme) : defaultTheme);
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem("textai-reduced-motion") === "true");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("textai-high-contrast") === "true");
  const [fontScale, setFontScale] = useState<FontScale>(() => (localStorage.getItem("textai-font-scale") as FontScale) || "md");
  useEffect(() => {
    const root = document.documentElement;
    const resolved = theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
    root.classList.toggle("dark", resolved === "dark");
    root.dataset.theme = resolved;
    root.classList.toggle("reduce-motion", reducedMotion);
    root.classList.toggle("high-contrast", highContrast);
    root.dataset.fontScale = fontScale;
    if (switchable) localStorage.setItem("theme", theme);
    localStorage.setItem("textai-reduced-motion", String(reducedMotion));
    localStorage.setItem("textai-high-contrast", String(highContrast));
    localStorage.setItem("textai-font-scale", fontScale);
  }, [theme, switchable, reducedMotion, highContrast, fontScale]);
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => document.documentElement.classList.toggle("dark", media.matches);
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [theme]);
  const toggleTheme = switchable ? () => setTheme(prev => prev === "dark" ? "light" : "dark") : undefined;
  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, switchable, reducedMotion, setReducedMotion, highContrast, setHighContrast, fontScale, setFontScale }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error("useTheme must be used within ThemeProvider"); return context; }
