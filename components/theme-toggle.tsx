"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { isTheme, resolveTheme, themes, themeStorageKey, type Theme } from "@/lib/theme";
import { useCopy } from "./language";

let sessionTheme: Theme | undefined;

function preferredTheme(): Theme {
  if (sessionTheme) return sessionTheme;
  try {
    const saved = resolveTheme(localStorage.getItem(themeStorageKey));
    if (saved) return saved;
  } catch {
    // Use the default mode when browser storage is unavailable.
  }
  return "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themes.find((option) => option.id === theme)!.color);
  window.dispatchEvent(new Event("convert-theme-change"));
}

function subscribe(callback: () => void) {
  const syncPreference = () => applyTheme(preferredTheme());
  const syncStorage = (event: StorageEvent) => {
    if (event.key === themeStorageKey || event.key === null) {
      sessionTheme = undefined;
      syncPreference();
    }
  };
  window.addEventListener("convert-theme-change", callback);
  window.addEventListener("storage", syncStorage);
  syncPreference();
  return () => {
    window.removeEventListener("convert-theme-change", callback);
    window.removeEventListener("storage", syncStorage);
  };
}

function getSnapshot(): Theme {
  const theme = document.documentElement.dataset.theme;
  return isTheme(theme) ? theme : "dark";
}

function selectTheme(next: Theme) {
  sessionTheme = next;
  try {
    localStorage.setItem(themeStorageKey, next);
  } catch {
    // The toggle remains usable for the current page without storage.
  }
  applyTheme(next);
}

export function ThemeToggle() {
  const t = useCopy();
  const theme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "dark" as Theme,
  );

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => selectTheme(getSnapshot() === "dark" ? "light" : "dark")}
      aria-label={t("Dark mode", "მუქი რეჟიმი")}
      aria-pressed={theme === "dark"}
      title={theme === "dark"
        ? t("Switch to light theme", "ღია თემაზე გადართვა")
        : t("Switch to dark theme", "მუქ თემაზე გადართვა")}
    >
      <span className="theme-mode-icon" data-mode="dark" data-active={theme === "dark"} aria-hidden="true">
        <Moon size={15} />
      </span>
      <span className="theme-mode-icon" data-mode="light" data-active={theme === "light"} aria-hidden="true">
        <Sun size={15} />
      </span>
    </button>
  );
}
