import { expect, test } from "@playwright/test";

test("validates reason, confirmation and command result", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /duplicate guard/ }).first().click();
  await expect(page.getByTestId("command-target-path")).toContainText("/root/duplicate-guard");
  await expect(page.getByTestId("command-target-path")).toHaveCSS("white-space", "nowrap");
  await page.getByRole("button", { name: /提交命令/ }).click();
  await expect(page.getByText("原因必填.")).toBeVisible();

  await page.getByLabel("command reason").fill("remove failed duplicate guard from test run");
  await page.getByRole("combobox", { name: "command select" }).click();
  await page.getByRole("option", { name: "移除子任务" }).click();
  await page.getByRole("button", { name: /提交命令/ }).click();

  await expect(page.getByRole("dialog", { name: "confirm command" })).toBeVisible();
  await expect(page.getByRole("button", { name: /确认提交/ })).toBeDisabled();

  await page.getByLabel("danger confirmation").click();
  await expect(page.getByRole("button", { name: /确认提交/ })).toBeEnabled();
  await page.getByRole("button", { name: /确认提交/ }).click();

  await expect(page.getByText(/命令结果:/)).toBeVisible();
  await expect(page.getByTestId("event-log")).toContainText("命令审计: 移除子任务");
});
