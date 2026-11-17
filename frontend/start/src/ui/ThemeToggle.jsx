"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import ButtonIcon from "@/ui/buttonicon";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { isDarkMode, isReady, toggleTheme } = useTheme();
  const showDarkMode = isReady && isDarkMode;
  const label = showDarkMode ? "فعال‌کردن حالت روز" : "فعال‌کردن حالت شب";

  return (
    <ButtonIcon
      type="button"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      disabled={!isReady}
      variant="outline"
      className="theme-toggle h-10 w-10 text-accent-600 transition disabled:cursor-wait disabled:opacity-70 lg:h-10 lg:w-auto lg:gap-2 lg:px-3"
    >
      {showDarkMode ? <MoonIcon aria-hidden="true" /> : <SunIcon aria-hidden="true" />}
    </ButtonIcon>
  );
}
