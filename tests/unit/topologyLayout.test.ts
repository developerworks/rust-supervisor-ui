import { describe, expect, it } from "vitest";
import { buildTopologyNodePositions } from "@/components/topology/nodeLayout";
import type { SupervisorEdge, SupervisorNode } from "@/types/protocol";

function node(path: string): SupervisorNode {
  return {
    node_id: path,
    path,
    name: path.split("/").at(-1) ?? path,
    kind: path === "/root" ? "root_supervisor" : "child_task",
    tags: [],
    criticality: "standard",
    state_summary: "running"
  };
}

function parentEdge(targetPath: string, order: number): SupervisorEdge {
  return {
    edge_id: `parent:/root->${targetPath}`,
    source_path: "/root",
    target_path: targetPath,
    kind: "parent_child",
    order
  };
}

describe("topology node layout", () => {
  it("keeps all children of one parent on the same level to avoid tree edge crossings", () => {
    const childPaths = [
      "/root/duplicate_guard",
      "/root/retry_scheduler",
      "/root/invoice_writer",
      "/root/index_stream",
      "/root/healthy_worker"
    ];
    const positions = buildTopologyNodePositions(
      [node("/root"), ...childPaths.map(node)],
      childPaths.map(parentEdge)
    );
    const root = positions.get("/root");
    const childPositions = childPaths.map((path) => positions.get(path));

    expect(root).toBeDefined();
    expect(childPositions.every(Boolean)).toBe(true);
    expect(new Set(childPositions.map((position) => position?.y)).size).toBe(1);
    expect(childPositions.map((position) => position?.x)).toEqual([80, 320, 560, 800, 1040]);
    expect(root?.x).toBe(560);
    expect(root?.y).toBeLessThan(childPositions[0]?.y ?? 0);
  });
});
