import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const topologyCanvas = resolve(repoRoot, "src/components/TopologyCanvas.vue");

describe("topology canvas manual node positions", () => {
  it("keeps dragged node positions when selecting nodes from the path list", () => {
    const source = readFileSync(topologyCanvas, "utf8");

    expect(source).toContain("manualNodePositions");
    expect(source).toContain("storeManualNodePosition");
    expect(source).toContain("@node-drag-stop=\"storeManualNodePosition\"");
    expect(source).toContain("manualPosition ?? autoPosition");
    expect(source).toContain("topologyPositionStorageKey");
    expect(source).toContain("loadManualNodePositions");
    expect(source).toContain("persistManualNodePositions");
    expect(source).toContain("localStorage.getItem(topologyPositionStorageKey)");
    expect(source).toContain("localStorage.setItem(topologyPositionStorageKey");
    expect(source).toContain("@click=\"stateStore.selectNode(node.path)\"");
    expect(source).toContain("clearManualNodePositionsForCurrentTarget");
    expect(source).toContain("@click=\"relayoutTopology\"");
  });
});
