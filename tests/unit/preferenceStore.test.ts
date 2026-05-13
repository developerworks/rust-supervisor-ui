import { describe, expect, it, beforeEach } from "vitest";

import {
  initializePreferences,
  preferenceState,
  resolveThemeMode,
  setLocale,
  setThemeMode
} from "@/state/preferenceStore";

describe("preferenceStore", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    initializePreferences({
      documentElement: document.documentElement,
      hour: 12,
      storage: localStorage,
      systemPrefersDark: false
    });
  });

  it("uses Chinese and system theme by default", () => {
    expect(preferenceState.locale).toBe("zh-CN");
    expect(preferenceState.themeMode).toBe("system");
    expect(preferenceState.resolvedTheme).toBe("light");
  });

  it("persists locale changes", () => {
    setLocale("en-US");

    expect(preferenceState.locale).toBe("en-US");
    expect(localStorage.getItem("rust-supervisor-ui:locale")).toBe("en-US");
  });

  it("resolves system and time theme modes", () => {
    expect(resolveThemeMode("system", { systemPrefersDark: true })).toBe("dark");
    expect(resolveThemeMode("system", { systemPrefersDark: false })).toBe("light");
    expect(resolveThemeMode("time", { hour: 5 })).toBe("dark");
    expect(resolveThemeMode("time", { hour: 12 })).toBe("light");
    expect(resolveThemeMode("time", { hour: 21 })).toBe("dark");
  });

  it("persists theme changes and applies the dark class", () => {
    setThemeMode("dark");

    expect(preferenceState.themeMode).toBe("dark");
    expect(preferenceState.resolvedTheme).toBe("dark");
    expect(localStorage.getItem("rust-supervisor-ui:theme-mode")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("ignores stale layout preferences", () => {
    localStorage.setItem("rust-supervisor-ui:layout-mode", "legacy-panel-layout");

    initializePreferences({
      documentElement: document.documentElement,
      hour: 12,
      storage: localStorage,
      systemPrefersDark: false
    });

    expect("layoutMode" in preferenceState).toBe(false);
    expect(preferenceState.locale).toBe("zh-CN");
  });
});
