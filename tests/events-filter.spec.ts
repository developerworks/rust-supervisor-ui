import { expect, test } from "@playwright/test";

test("filters event and log records and shows dropped counts", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("event-log")).toContainText("子任务失败");
  await expect(page.getByText("丢弃事件 3")).toBeVisible();

  await page.getByRole("combobox", { name: "severity filter" }).click();
  await page.getByRole("option", { name: "错误" }).click();
  await page.getByRole("combobox", { name: "event type filter" }).click();
  await page.getByRole("option", { name: "子任务失败" }).click();
  await page.getByLabel("correlation filter").fill("restart-7");
  await page.getByRole("button", { name: /应用/ }).click();

  await expect(page.getByTestId("timeline-record")).toHaveCount(1);
  await expect(page.getByTestId("event-log")).toContainText("子任务失败");
  await expect(page.getByTestId("event-log")).not.toContainText("子任务已重启");

  await page.getByRole("button", { name: /清除/ }).click();
  await expect(page.getByTestId("timeline-record")).toHaveCount(10);
});
