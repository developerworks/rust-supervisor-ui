import { expect, test } from "@playwright/test";

test("switches language through menubar and persists the locale", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "目标进程" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "command select" })).toContainText("暂停子任务");
  await expect(page.getByRole("combobox", { name: "event type filter" })).toContainText("全部事件类型");
  await expect(page.getByText("command(命令)")).toHaveCount(0);
  await expect(page.getByText("lifecycle_state(生命周期状态)")).toHaveCount(0);

  await page.getByRole("menuitem", { name: /语言/ }).click();
  await page.getByRole("menuitemradio", { name: "英文" }).click();

  await expect(page.getByRole("heading", { name: "Targets" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Submit command/ })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "command select" })).toContainText("Pause child");
  await expect(page.getByRole("combobox", { name: "event type filter" })).toContainText("All event types");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Targets" })).toBeVisible();
});

test("switches dark and light themes through menubar and persists manual theme", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("menuitem", { name: /主题/ }).click();
  await page.getByRole("menuitemradio", { name: "暗色" }).click();

  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.getByRole("menuitem", { name: /主题/ }).click();
  await page.getByRole("menuitemradio", { name: "亮色" }).click();

  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("switches dashboard layout through menubar", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("dashboard-standard-layout")).toBeVisible();
  await expect(page.getByTestId("dashboard-standard-layout").locator(":scope > div").first()).toHaveCSS("border-top-left-radius", "0px");
  await expect(page.getByTestId("dashboard-standard-layout").locator(":scope > div").first()).toHaveCSS("border-top-width", "0px");

  await page.getByRole("menuitem", { name: /布局/ }).click();
  await page.getByRole("menuitemradio", { name: "侧边栏 07" }).click();

  await expect(page.getByTestId("dashboard-sidebar-layout")).toBeVisible();
  await expect(page.getByTestId("dashboard-sidebar-layout")).toHaveCSS("border-top-left-radius", "0px");
  await expect(page.getByTestId("dashboard-sidebar-layout")).toHaveCSS("border-top-width", "0px");
  await page.reload();
  await expect(page.getByTestId("dashboard-sidebar-layout")).toBeVisible();

  await page.getByRole("menuitem", { name: /布局/ }).click();
  await page.getByRole("menuitemradio", { name: "标准布局" }).click();
  await expect(page.getByTestId("dashboard-standard-layout")).toBeVisible();
});
