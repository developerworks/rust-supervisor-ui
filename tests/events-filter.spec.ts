import { expect, test } from "@playwright/test";

test("filters event and log records and shows dropped counts", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("event-log")).toContainText("child_failed");
  await expect(page.getByText("Dropped events 3")).toBeVisible();

  await page.getByLabel("severity filter").selectOption("error");
  await page.getByLabel("event type filter").selectOption("child_failed");
  await page.getByLabel("correlation filter").fill("restart-7");
  await page.getByRole("button", { name: /应用/ }).click();

  await expect(page.getByTestId("timeline-record")).toHaveCount(1);
  await expect(page.getByTestId("event-log")).toContainText("child_failed");
  await expect(page.getByTestId("event-log")).not.toContainText("child_restarted");

  await page.getByRole("button", { name: /清除/ }).click();
  await expect(page.getByTestId("timeline-record")).toHaveCount(10);
});
