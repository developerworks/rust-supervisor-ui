import { computed, reactive } from "vue";

export type LocaleCode = "zh-CN" | "en-US";
export type ThemeMode = "system" | "time" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";
export type LayoutMode = "standard" | "sidebar-07";

export interface PreferenceEnvironment {
  storage?: Storage;
  documentElement?: HTMLElement;
  systemPrefersDark?: boolean;
  hour?: number;
  mediaQuery?: MediaQueryList;
}

interface PreferenceState {
  locale: LocaleCode;
  themeMode: ThemeMode;
  layoutMode: LayoutMode;
  resolvedTheme: ResolvedTheme;
}

const localeStorageKey = "rust-supervisor-ui:locale";
const themeModeStorageKey = "rust-supervisor-ui:theme-mode";
const layoutModeStorageKey = "rust-supervisor-ui:layout-mode";
const supportedLocales: LocaleCode[] = ["zh-CN", "en-US"];
const supportedThemeModes: ThemeMode[] = ["system", "time", "light", "dark"];
const supportedLayoutModes: LayoutMode[] = ["standard", "sidebar-07"];

let activeEnvironment: PreferenceEnvironment = {};
let mediaCleanup: (() => void) | undefined;
let timeTimer: number | undefined;

export const preferenceState = reactive<PreferenceState>({
  locale: "zh-CN",
  themeMode: "system",
  layoutMode: "standard",
  resolvedTheme: "light"
});

export const resolvedTheme = computed(() => preferenceState.resolvedTheme);
export const isDark = computed(() => preferenceState.resolvedTheme === "dark");

export function initializePreferences(environment: PreferenceEnvironment = browserEnvironment()): void {
  activeEnvironment = environment;
  preferenceState.locale = readLocale(environment.storage);
  preferenceState.themeMode = readThemeMode(environment.storage);
  preferenceState.layoutMode = readLayoutMode(environment.storage);
  applyTheme();
  bindThemeSources();
}

export function setLocale(locale: LocaleCode): void {
  preferenceState.locale = locale;
  activeEnvironment.storage?.setItem(localeStorageKey, locale);
}

export function setThemeMode(mode: ThemeMode): void {
  preferenceState.themeMode = mode;
  activeEnvironment.storage?.setItem(themeModeStorageKey, mode);
  applyTheme();
  bindThemeSources();
}

export function setLayoutMode(mode: LayoutMode): void {
  preferenceState.layoutMode = mode;
  activeEnvironment.storage?.setItem(layoutModeStorageKey, mode);
}

export function resolveThemeMode(mode: ThemeMode, environment: PreferenceEnvironment = activeEnvironment): ResolvedTheme {
  if (mode === "dark") {
    return "dark";
  }
  if (mode === "light") {
    return "light";
  }
  if (mode === "time") {
    const hour = environment.hour ?? new Date().getHours();
    return hour >= 19 || hour < 6 ? "dark" : "light";
  }
  return systemPrefersDark(environment) ? "dark" : "light";
}

function applyTheme(): void {
  const nextTheme = resolveThemeMode(preferenceState.themeMode, activeEnvironment);
  preferenceState.resolvedTheme = nextTheme;
  activeEnvironment.documentElement?.classList.toggle("dark", nextTheme === "dark");
}

function bindThemeSources(): void {
  mediaCleanup?.();
  mediaCleanup = undefined;
  if (timeTimer) {
    window.clearInterval(timeTimer);
    timeTimer = undefined;
  }

  if (preferenceState.themeMode === "system" && activeEnvironment.mediaQuery) {
    const listener = () => applyTheme();
    activeEnvironment.mediaQuery.addEventListener("change", listener);
    mediaCleanup = () => activeEnvironment.mediaQuery?.removeEventListener("change", listener);
  }

  if (preferenceState.themeMode === "time" && typeof window !== "undefined") {
    timeTimer = window.setInterval(applyTheme, 60_000);
  }
}

function readLocale(storage?: Storage): LocaleCode {
  const stored = storage?.getItem(localeStorageKey);
  return supportedLocales.includes(stored as LocaleCode) ? (stored as LocaleCode) : "zh-CN";
}

function readThemeMode(storage?: Storage): ThemeMode {
  const stored = storage?.getItem(themeModeStorageKey);
  return supportedThemeModes.includes(stored as ThemeMode) ? (stored as ThemeMode) : "system";
}

function readLayoutMode(storage?: Storage): LayoutMode {
  const stored = storage?.getItem(layoutModeStorageKey);
  return supportedLayoutModes.includes(stored as LayoutMode) ? (stored as LayoutMode) : "standard";
}

function systemPrefersDark(environment: PreferenceEnvironment): boolean {
  if (typeof environment.systemPrefersDark === "boolean") {
    return environment.systemPrefersDark;
  }
  return environment.mediaQuery?.matches ?? false;
}

function browserEnvironment(): PreferenceEnvironment {
  const mediaQuery =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : undefined;
  return {
    documentElement: typeof document !== "undefined" ? document.documentElement : undefined,
    mediaQuery,
    storage: typeof window !== "undefined" ? window.localStorage : undefined
  };
}
