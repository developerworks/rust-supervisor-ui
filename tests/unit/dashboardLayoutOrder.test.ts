import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dashboardLayout = resolve(repoRoot, "src/components/dashboard/DashboardLayout.vue");
const dashboardInspector = resolve(repoRoot, "src/components/dashboard/DashboardInspector.vue");

describe("dashboard layout order", () => {
  it("places target runtime state between topology and log workspace", () => {
    const layoutSource = readFileSync(dashboardLayout, "utf8");
    const topologyIndex = layoutSource.indexOf("<TopologyCanvas />");
    const runtimeIndex = layoutSource.indexOf("<RuntimeStatePanel />");
    const logWorkspaceIndex = layoutSource.indexOf("<DashboardLogWorkspace");

    expect(runtimeIndex).toBeGreaterThan(topologyIndex);
    expect(runtimeIndex).toBeLessThan(logWorkspaceIndex);
    expect(layoutSource).toContain("data-testid=\"dashboard-runtime-state\"");
  });

  it("keeps target runtime state out of the context inspector", () => {
    const inspectorSource = readFileSync(dashboardInspector, "utf8");

    expect(inspectorSource).not.toContain("RuntimeStatePanel");
  });
});
