import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const topologyCanvas = resolve(repoRoot, "src/components/TopologyCanvas.vue");

describe("topology canvas interaction guard", () => {
  it("requires focus before wheel zoom can capture page scrolling", () => {
    const source = readFileSync(topologyCanvas, "utf8");

    expect(source).toContain("const canvasFocused = ref(false)");
    expect(source).toContain("handleGlobalPointerDown");
    expect(source).toContain("window.addEventListener(\"pointerdown\", handleGlobalPointerDown, true)");
    expect(source).toContain("tabindex=\"0\"");
    expect(source).toContain(":zoom-on-scroll=\"canvasFocused\"");
    expect(source).toContain(":prevent-scrolling=\"canvasFocused\"");
    expect(source).toContain("canvasFocused ? 'border-primary ring-2 ring-primary/30' : 'border-border'");
  });
});
