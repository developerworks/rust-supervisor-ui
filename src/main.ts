import { createApp, watch } from "vue";
import App from "./App.vue";
import { i18n, syncI18nLocale } from "@/i18n";
import { initializePreferences, preferenceState } from "@/state/preferenceStore";
import "vue-sonner/style.css";
import "./assets/main.css";

declare global {
  interface Window {
    __RUST_SUPERVISOR_UI_BASELINE__?: {
      framework: "Vue";
      componentLibrary: "shadcn-vue";
      styleFramework: "Tailwind";
    };
  }
}

window.__RUST_SUPERVISOR_UI_BASELINE__ = {
  framework: "Vue",
  componentLibrary: "shadcn-vue",
  styleFramework: "Tailwind"
};

initializePreferences();
watch(() => preferenceState.locale, syncI18nLocale, { immediate: true });

createApp(App).use(i18n).mount("#app");
