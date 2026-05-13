import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const topologyCanvas = resolve(repoRoot, "src/components/TopologyCanvas.vue");

describe("topology canvas resize fit", () => {
  it("fits the existing layout when the browser window changes size", () => {
    const source = readFileSync(topologyCanvas, "utf8");

    expect(source).toContain("scheduleFitTopologyView");
    expect(source).toContain("window.addEventListener(\"resize\", scheduleFitTopologyView)");
    expect(source).toContain("window.removeEventListener(\"resize\", scheduleFitTopologyView)");
    expect(source).toContain("void fitTopologyView()");
    expect(source).not.toContain("window.addEventListener(\"resize\", relayoutTopology)");
  });
});
