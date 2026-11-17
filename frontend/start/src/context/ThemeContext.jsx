"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

const ThemeContext = createContext(null);
const THEME_KEY = "blog-theme";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark-mode", theme === "dark");
  root.classList.toggle("light-mode", theme !== "dark");
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }) {
  const [savedTheme, setSavedTheme, isStorageLoaded] = useLocalStorage(THEME_KEY, null);
  const theme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : (typeof window === "undefined" ? "light" : getSystemTheme());
  const isReady = isStorageLoaded;

  useEffect(() => {
    if (isReady) applyTheme(theme);
  }, [isReady, theme]);

  const toggleTheme = useCallback(() => {
    setSavedTheme(theme === "dark" ? "light" : "dark");
  }, [setSavedTheme, theme]);

  const contextValue = useMemo(() => ({ theme, isDarkMode: theme === "dark", isReady, toggleTheme }), [isReady, theme, toggleTheme]);
  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
