import { createApp } from "vue";
import App from "./App.vue";
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

createApp(App).mount("#app");
