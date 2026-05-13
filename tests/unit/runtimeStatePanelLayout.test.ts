import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const runtimeStatePanel = resolve(repoRoot, "src/components/dashboard/RuntimeStatePanel.vue");

describe("runtime state panel layout", () => {
  it("shows child paths without truncating them", () => {
    const source = readFileSync(runtimeStatePanel, "utf8");

    expect(source).toContain("{{ runtimeState.child_path }}");
    expect(source).not.toContain("truncate font-semibold text-foreground");
    expect(source).toContain("break-all font-semibold leading-snug text-foreground");
  });
});
