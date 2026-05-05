import { expect, test } from "@playwright/test";

test("finds failed, quarantined and restarting child tasks and exposes frontend baseline", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("duplicate guard").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("retry scheduler").first()).toBeVisible();
  await page.getByRole("button", { name: /billing worker b/ }).click();
  await expect(page.getByText("invoice writer").first()).toBeVisible();

  await expect(page.locator("[data-framework='Vue']")).toBeVisible();
  const baseline = await page.evaluate(() => window.__RUST_SUPERVISOR_UI_BASELINE__);
  expect(baseline).toEqual({
    framework: "Vue",
    componentLibrary: "shadcn-vue",
    styleFramework: "Tailwind"
  });
});
