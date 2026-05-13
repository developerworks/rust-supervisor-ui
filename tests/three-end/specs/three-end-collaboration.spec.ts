import { expect, test } from "@playwright/test";

test("runs the real supervisor relay supervisor UI collaboration path", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("target-list")).toContainText("payments worker a");
  await expect(page.getByTestId("target-list")).toContainText("已连接");
  await expect(page.getByTestId("topology-canvas")).toBeVisible();
  await expect(page.getByText("duplicate guard").first()).toBeVisible();
  await expect(page.getByText("healthy worker").first()).toBeVisible();

  await page.getByRole("button", { name: /duplicate guard/ }).first().click();
  await expect(page.getByTestId("node-detail")).toContainText("失败");
  await expect(page.getByTestId("node-detail")).toContainText("duplicate event window exceeded");

  await expect(page.getByTestId("runtime-state-panel")).toContainText("运行中");
  await expect(page.getByTestId("runtime-state-panel")).toContainText("失败");
  await expect(page.getByTestId("runtime-state-panel")).toContainText("暂停");

  await expect(page.getByTestId("event-log")).toContainText("子任务失败");
  await expect(page.getByTestId("event-log")).toContainText("invoice writer is paused");

  await page.getByRole("combobox", { name: "severity filter" }).click();
  await page.getByRole("option", { name: "错误" }).click();
  await page.getByRole("button", { name: /应用/ }).click();
  await expect(page.getByTestId("event-log")).toContainText("子任务失败");

  await expect(page.getByTestId("command-target-path")).toContainText("/root/duplicate_guard");
  await page.getByLabel("command reason").fill("three end collaboration test");
  await page.getByRole("combobox", { name: "command select" }).click();
  await page.getByRole("option", { name: "暂停子任务" }).click();
  await page.getByRole("button", { name: /提交命令/ }).click();

  await expect(page.getByText(/命令结果:/)).toBeVisible();
});
