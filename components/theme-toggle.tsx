"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useCopy } from "./language";

type Theme = "light" | "dark";
const storageKey = "convert-theme";
const mediaQuery = "(prefers-color-scheme: dark)";

function preferredTheme(): Theme {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // System preference still works when browser storage is unavailable.
  }
  return window.matchMedia(mediaQuery).matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#111b2c" : "#f6f8fc");
  window.dispatchEvent(new Event("convert-theme-change"));
}

function subscribe(callback: () => void) {
  const media = window.matchMedia(mediaQuery);
  const syncPreference = () => applyTheme(preferredTheme());
  const syncStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) syncPreference();
  };
  window.addEventListener("convert-theme-change", callback);
  window.addEventListener("storage", syncStorage);
  media.addEventListener("change", syncPreference);
  syncPreference();
  return () => {
    window.removeEventListener("convert-theme-change", callback);
    window.removeEventListener("storage", syncStorage);
    media.removeEventListener("change", syncPreference);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const t = useCopy();
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "light" as Theme,
  );

  function toggle() {
    const next = getSnapshot() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // The switch remains usable for the current page without storage.
    }
    applyTheme(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={t("Dark mode", "მუქი რეჟიმი")}
      aria-pressed={theme === "dark"}
      title={t("Toggle dark mode", "მუქი რეჟიმის გადართვა")}
    >
      <Moon className="theme-icon-moon" size={17} aria-hidden="true" />
      <Sun className="theme-icon-sun" size={17} aria-hidden="true" />
    </button>
  );
}
