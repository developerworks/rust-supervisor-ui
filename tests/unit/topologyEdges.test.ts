import { describe, expect, it } from "vitest";
import { buildTopologyFlowEdges, topologyEdgeType } from "@/components/topology/edgeLayout";

describe("topology edge layout", () => {
  it("separates sibling edges with offset bezier curve data", () => {
    const edges = buildTopologyFlowEdges(
      [
        {
          edge_id: "parent:/root->/root/a",
          source_path: "/root",
          target_path: "/root/a",
          kind: "parent_child",
          order: 0
        },
        {
          edge_id: "parent:/root->/root/b",
          source_path: "/root",
          target_path: "/root/b",
          kind: "parent_child",
          order: 1
        },
        {
          edge_id: "parent:/root->/root/c",
          source_path: "/root",
          target_path: "/root/c",
          kind: "parent_child",
          order: 2
        }
      ],
      new Set(["/root", "/root/a", "/root/b", "/root/c"]),
      "depends on"
    );

    expect(edges).toHaveLength(3);
    expect(edges.every((edge) => edge.type === topologyEdgeType)).toBe(true);
    expect(edges.map((edge) => edge.data?.curveOffset)).toEqual([-28, 0, 28]);
    expect(new Set(edges.map((edge) => edge.data?.curveOffset)).size).toBe(3);
  });
});
