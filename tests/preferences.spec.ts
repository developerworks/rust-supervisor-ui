import { expect, test } from "@playwright/test";

test("switches language through menubar and persists the locale", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "目标进程" })).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub 仓库" })).toHaveAttribute(
    "href",
    "https://github.com/developerworks/rust-supervisor-ui"
  );
  await expect(page.getByRole("combobox", { name: "command select" })).toContainText("暂停子任务");
  await expect(page.getByRole("combobox", { name: "event type filter" })).toContainText("全部事件类型");
  await expect(page.getByText("command(命令)")).toHaveCount(0);
  await expect(page.getByText("lifecycle_state(生命周期状态)")).toHaveCount(0);

  await page.getByRole("menuitem", { name: /语言/ }).click();
  await page.getByRole("menuitemradio", { name: "英文" }).click();

  await expect(page.getByRole("heading", { name: "Targets" })).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub repository" })).toBeVisible();
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

test("renders the single dashboard layout without layout switching", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("dashboard-standard-layout")).toBeVisible();
  await expect(page.getByTestId("dashboard-inspector")).toBeVisible();
  await expect(page.getByTestId("dashboard-left-rail")).toBeVisible();
  await expect(page.getByTestId("dashboard-main-column")).toBeVisible();
  await expect(page.getByTestId("dashboard-log-workspace")).toBeVisible();
  await expect(page.getByTestId("dashboard-bottom-panel")).toHaveCount(0);
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.getByTestId("runtime-state-panel")).toHaveCount(0);
  await expect(page.getByTestId("diagnostics-panel")).toBeVisible();
  await expect(page.getByTestId("dashboard-sidebar-layout")).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: /布局/ })).toHaveCount(0);
  await expect(page.getByTestId("dashboard-standard-layout")).toBeVisible();
});
