import { expect, test } from "@playwright/test";

test("validates reason, confirmation and command result", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /duplicate guard/ }).first().click();
  await page.getByRole("button", { name: /提交命令/ }).click();
  await expect(page.getByText("reason(原因) 必填.")).toBeVisible();

  await page.getByLabel("command reason").fill("remove failed duplicate guard from test run");
  await page.getByLabel("command select").selectOption("remove_child");
  await page.getByRole("button", { name: /提交命令/ }).click();

  await expect(page.getByRole("dialog", { name: "confirm command" })).toBeVisible();
  await expect(page.getByRole("button", { name: /确认提交/ })).toBeDisabled();

  await page.getByLabel("danger confirmation").click();
  await expect(page.getByRole("button", { name: /确认提交/ })).toBeEnabled();
  await page.getByRole("button", { name: /确认提交/ }).click();

  await expect(page.getByText(/command result\(命令结果\):/)).toBeVisible();
  await expect(page.getByTestId("event-log")).toContainText("command audit(命令审计): remove_child");
});
