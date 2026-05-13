import type { Edge } from "@vue-flow/core";
import type { SupervisorEdge, SupervisorEdgeKind } from "@/types/protocol";

export const topologyEdgeType = "offset-bezier";

const siblingOffsetStep = 28;

export interface TopologyEdgeData {
  curveOffset: number;
  edgeKind: SupervisorEdgeKind;
  siblingCount: number;
  siblingIndex: number;
}

export interface OffsetBezierPathInput {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  curveOffset: number;
}

export interface OffsetBezierPath {
  labelX: number;
  labelY: number;
  path: string;
}

export function buildTopologyFlowEdges(
  edges: SupervisorEdge[],
  visibleNodePaths: Set<string>,
  dependencyLabel: string
): Edge<TopologyEdgeData>[] {
  const visibleEdges = edges.filter(
    (edge) => visibleNodePaths.has(edge.source_path) && visibleNodePaths.has(edge.target_path)
  );
  const siblingData = buildSiblingData(visibleEdges);

  return visibleEdges.map((edge) => {
    const data = siblingData.get(edge.edge_id) ?? {
      curveOffset: 0,
      edgeKind: edge.kind,
      siblingCount: 1,
      siblingIndex: 0
    };

    return {
      id: edge.edge_id,
      source: edge.source_path,
      target: edge.target_path,
      animated: edge.kind === "dependency",
      label: edge.kind === "dependency" ? dependencyLabel : undefined,
      type: topologyEdgeType,
      data,
      class: ["topology-edge", edge.kind === "dependency" ? "dependency-edge" : "tree-edge"].join(" ")
    };
  });
}

export function buildOffsetBezierPath(input: OffsetBezierPathInput): OffsetBezierPath {
  const verticalDistance = Math.abs(input.targetY - input.sourceY);
  const controlDistance = Math.max(verticalDistance * 0.45, 64);
  const sourceControlX = input.sourceX + input.curveOffset;
  const sourceControlY = input.sourceY + controlDistance;
  const targetControlX = input.targetX + input.curveOffset;
  const targetControlY = input.targetY - controlDistance;

  return {
    labelX:
      input.sourceX * 0.125 +
      sourceControlX * 0.375 +
      targetControlX * 0.375 +
      input.targetX * 0.125,
    labelY:
      input.sourceY * 0.125 +
      sourceControlY * 0.375 +
      targetControlY * 0.375 +
      input.targetY * 0.125,
    path: [
      `M ${input.sourceX},${input.sourceY}`,
      `C ${sourceControlX},${sourceControlY}`,
      `${targetControlX},${targetControlY}`,
      `${input.targetX},${input.targetY}`
    ].join(" ")
  };
}

function buildSiblingData(edges: SupervisorEdge[]): Map<string, TopologyEdgeData> {
  const groupedBySource = new Map<string, SupervisorEdge[]>();

  for (const edge of edges) {
    const siblings = groupedBySource.get(edge.source_path) ?? [];
    siblings.push(edge);
    groupedBySource.set(edge.source_path, siblings);
  }

  const result = new Map<string, TopologyEdgeData>();

  for (const siblings of groupedBySource.values()) {
    const ordered = [...siblings].sort((left, right) => {
      const orderDiff = left.order - right.order;
      return orderDiff === 0 ? left.edge_id.localeCompare(right.edge_id) : orderDiff;
    });
    const middleIndex = (ordered.length - 1) / 2;

    ordered.forEach((edge, siblingIndex) => {
      result.set(edge.edge_id, {
        curveOffset: (siblingIndex - middleIndex) * siblingOffsetStep,
        edgeKind: edge.kind,
        siblingCount: ordered.length,
        siblingIndex
      });
    });
  }

  return result;
}
