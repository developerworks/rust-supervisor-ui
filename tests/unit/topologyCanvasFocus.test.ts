import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const topologyCanvas = resolve(repoRoot, "src/components/TopologyCanvas.vue");

describe("topology canvas focus handling", () => {
  it("requires canvas focus before wheel zoom captures page scroll", () => {
    const source = readFileSync(topologyCanvas, "utf8");

    expect(source).toContain("canvasFocused");
    expect(source).toContain("handleGlobalPointerDown");
    expect(source).toContain(":zoom-on-scroll=\"canvasFocused\"");
    expect(source).toContain(":prevent-scrolling=\"canvasFocused\"");
    expect(source).toContain("border-primary");
    expect(source).toContain("border-border");
  });
});
