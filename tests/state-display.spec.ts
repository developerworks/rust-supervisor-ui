import { expect, test } from "@playwright/test";

test("renders target list, topology canvas, node detail and unavailable state", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("target-list")).toContainText("payments worker a");
  await expect(page.getByTestId("target-list")).toContainText("billing worker b");
  await expect(page.getByTestId("topology-canvas")).toBeVisible();
  await expect(page.getByText("duplicate guard").first()).toBeVisible();
  await expect(page.getByTestId("node-detail")).toContainText("payments root supervisor");

  await page.getByRole("button", { name: /duplicate guard/ }).first().click();
  await expect(page.getByTestId("node-detail")).toContainText("失败");
  await expect(page.getByTestId("node-detail")).toContainText("duplicate event window exceeded");

  await page.getByRole("button", { name: /billing worker b/ }).click();
  await expect(page.getByTestId("diagnostics")).toContainText("target_unavailable");
  await expect(page.getByText("billing root supervisor").first()).toBeVisible();
});

test("places log filters and event log in one workspace row", async ({ page }) => {
  await page.goto("/");

  const layout = page.getByTestId("dashboard-layout");
  const inspector = page.getByTestId("dashboard-inspector");
  const logWorkspace = page.getByTestId("dashboard-log-workspace");

  await expect(layout).toBeVisible();
  await expect(page.getByTestId("status-strip")).toBeVisible();
  await expect(logWorkspace.locator("[aria-label='filters']")).toBeVisible();
  await expect(logWorkspace.locator("[aria-label='event log']")).toBeVisible();
  await expect(inspector.locator("[aria-label='target list']")).toBeVisible();
  await expect(inspector.locator("[aria-label='node detail']")).toBeVisible();
  await expect(inspector.locator("[aria-label='control panel']")).toBeVisible();
  await expect(inspector.locator("[aria-label='filters']")).toHaveCount(0);

  const viewportWidth = page.viewportSize()?.width ?? 0;
  const layoutWidth = await layout.evaluate((element) => element.getBoundingClientRect().width);
  expect(layoutWidth).toBeGreaterThanOrEqual(viewportWidth - 2);

  const fieldLeftEdges = await page
    .getByTestId("filter-form")
    .locator(":scope > div")
    .evaluateAll((fields) => fields.map((field) => Math.round(field.getBoundingClientRect().left)));
  expect(new Set(fieldLeftEdges).size).toBe(1);
});
