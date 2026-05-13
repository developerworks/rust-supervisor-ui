import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dashboardStatusStrip = resolve(repoRoot, "src/components/dashboard/DashboardStatusStrip.vue");

describe("dashboard status strip layout", () => {
  it("shows the full mTLS certificate fingerprint identity", () => {
    const source = readFileSync(dashboardStatusStrip, "utf8");

    expect(source).not.toContain("max-w-[12rem] truncate");
    expect(source).toContain("data-testid=\"identity-status\"");
    expect(source).toContain("data-testid=\"identity-status-value\"");
    expect(source).toContain("class=\"w-full min-w-0");
    expect(source).toContain("font-mono");
    expect(source).toContain("break-all");
  });
});
