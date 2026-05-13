import { createI18n } from "vue-i18n";
import { messages } from "@/i18n/messages";
import { preferenceState, type LocaleCode } from "@/state/preferenceStore";

export const i18n = createI18n({
  fallbackLocale: "zh-CN",
  legacy: false,
  locale: preferenceState.locale,
  messages
});

export function syncI18nLocale(locale: LocaleCode): void {
  i18n.global.locale.value = locale;
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}
