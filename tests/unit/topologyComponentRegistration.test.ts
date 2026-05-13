import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const topologyCanvas = resolve(repoRoot, "src/components/TopologyCanvas.vue");

describe("topology component registration", () => {
  it("marks custom edge components as raw before passing them to VueFlow", () => {
    const source = readFileSync(topologyCanvas, "utf8");

    expect(source).toContain("markRaw");
    expect(source).toContain("const edgeTypes = markRaw({");
    expect(source).toContain("[topologyEdgeType]: OffsetBezierEdge");
  });
});
