import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const runtimeStatePanel = resolve(repoRoot, "src/components/dashboard/RuntimeStatePanel.vue");

describe("runtime state panel path layout", () => {
  it("places the child path above the runtime state badges and shows complete state details", () => {
    const source = readFileSync(runtimeStatePanel, "utf8");

    const pathIndex = source.indexOf("{{ runtimeState.child_path }}");
    const badgesIndex = source.indexOf("data-testid=\"runtime-state-badges\"");

    expect(source).toContain("class=\"flex flex-col gap-3 p-3 text-sm\"");
    expect(source).not.toContain("max-h-[28rem]");
    expect(source).not.toContain("ScrollArea");
    expect(source).toContain("break-all font-semibold leading-snug text-foreground");
    expect(source).toContain("data-testid=\"runtime-state-badges\"");
    expect(source).toContain("protocolLabels.readiness(runtimeState.readiness)");
    expect(source).toContain("protocolLabels.stateSummary(runtimeState.shutdown_state)");
    expect(source).toContain("runtimeState.last_failure");
    expect(source).toContain("runtimeState.last_policy_decision");
    expect(pathIndex).toBeGreaterThan(-1);
    expect(badgesIndex).toBeGreaterThan(pathIndex);
  });
});
