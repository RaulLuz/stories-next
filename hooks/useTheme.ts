import { useState, useEffect } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "stories_app_theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (stored === "dark" || stored === "light") {
      return stored;
    }
    
    // Detectar preferência do sistema
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, setTheme, toggleTheme };
}
