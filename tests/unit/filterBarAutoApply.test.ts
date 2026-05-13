import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const filterBar = resolve(repoRoot, "src/components/FilterBar.vue");

describe("filter bar auto apply", () => {
  it("emits filter updates from field changes without an apply button", () => {
    const source = readFileSync(filterBar, "utf8");

    expect(source).toContain("watch(");
    expect(source).toContain("emitCurrentFilters");
    expect(source).not.toContain("@submit=\"applyFilters\"");
    expect(source).not.toContain("type=\"submit\"");
    expect(source).not.toContain("t(\"common.apply\")");
    expect(source).toContain("type=\"button\"");
    expect(source).toContain("t(\"common.clear\")");
  });
});
