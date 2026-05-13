import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { beforeEach, describe, expect, it } from "vitest";

import DashboardBlockingAlert from "@/components/dashboard/DashboardBlockingAlert.vue";
import { i18n } from "@/i18n";
import { stateStore } from "@/state/stateStore";

describe("DashboardBlockingAlert", () => {
  beforeEach(() => {
    stateStore.reset();
    i18n.global.locale.value = "zh-CN";
    stateStore.addDiagnostic({
      code: "invalid_relay_url",
      stage: "configuration",
      message: "relay URL must use wss://",
      retryable: false
    });
  });

  it("uses a compact handle and toggles the blocking alert drawer", async () => {
    const wrapper = mount(DashboardBlockingAlert, {
      attachTo: document.body,
      global: {
        plugins: [i18n]
      }
    });

    const handle = wrapper.get('[data-testid="blocking-alert-handle"]');
    expect(handle.text()).toContain("中继服务未配置");
    expect(handle.text()).toContain("展开");
    expect(wrapper.get('[data-testid="blocking-alert"]').isVisible()).toBe(false);

    await handle.trigger("click");
    await nextTick();

    expect(wrapper.get('[data-testid="blocking-alert"]').isVisible()).toBe(true);
    expect(wrapper.get('[data-testid="blocking-alert"]').text()).toContain("relay URL must use wss://");
    expect(wrapper.get('[data-testid="blocking-alert-handle"]').text()).toContain("收起");

    await wrapper.get('[data-testid="blocking-alert-handle"]').trigger("click");
    await nextTick();

    expect(wrapper.get('[data-testid="blocking-alert"]').isVisible()).toBe(false);

    wrapper.unmount();
  });
});
