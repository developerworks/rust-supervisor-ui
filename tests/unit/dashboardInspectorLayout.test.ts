import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dashboardInspector = resolve(repoRoot, "src/components/dashboard/DashboardInspector.vue");

describe("dashboard inspector layout", () => {
  it("separates inspector blocks with visible dividers", () => {
    const source = readFileSync(dashboardInspector, "utf8");

    expect(source).toContain("divide-y divide-border");
    expect(source).toContain("<Box class=\"pb-4\">");
    expect(source).toContain("<Box class=\"py-4\">");
  });
});
