import { expect, test } from "@playwright/test";

test("renders target list, topology canvas, node detail and unavailable state", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("target-list")).toContainText("payments worker a");
  await expect(page.getByTestId("target-list")).toContainText("billing worker b");
  await expect(page.getByTestId("topology-canvas")).toBeVisible();
  await expect(page.getByText("duplicate guard").first()).toBeVisible();
  await expect(page.getByTestId("node-detail")).toContainText("payments root supervisor");

  await page.getByRole("button", { name: /duplicate guard/ }).first().click();
  await expect(page.getByTestId("node-detail")).toContainText("failed");
  await expect(page.getByTestId("node-detail")).toContainText("duplicate event window exceeded");

  await page.getByRole("button", { name: /billing worker b/ }).click();
  await expect(page.getByTestId("diagnostics")).toContainText("target_unavailable");
  await expect(page.getByText("billing root supervisor").first()).toBeVisible();
});
