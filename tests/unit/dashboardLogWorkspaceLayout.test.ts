import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dashboardLogWorkspace = resolve(repoRoot, "src/components/dashboard/DashboardLogWorkspace.vue");

describe("dashboard log workspace layout", () => {
  it("places log filters above events and logs", () => {
    const source = readFileSync(dashboardLogWorkspace, "utf8");
    const filterIndex = source.indexOf("<FilterBar");
    const eventLogIndex = source.indexOf("<EventLogPanel");

    expect(filterIndex).toBeGreaterThan(-1);
    expect(eventLogIndex).toBeGreaterThan(filterIndex);
    expect(source).toContain("data-testid=\"dashboard-log-filters\"");
    expect(source).toContain("data-testid=\"dashboard-log-events\"");
    expect(source).not.toContain("lg:grid-cols-[16rem_auto_minmax(0,1fr)]");
    expect(source).not.toContain("orientation=\"vertical\"");
  });
});
