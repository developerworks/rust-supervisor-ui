import type { SupervisorEdge, SupervisorNode } from "@/types/protocol";

const leftPadding = 80;
const topPadding = 30;
const horizontalGap = 240;
const verticalGap = 170;

export interface TopologyNodePosition {
  x: number;
  y: number;
}

export function buildTopologyNodePositions(
  nodes: SupervisorNode[],
  edges: SupervisorEdge[]
): Map<string, TopologyNodePosition> {
  const nodePaths = new Set(nodes.map((node) => node.path));
  const childrenBySource = buildChildrenBySource(edges, nodePaths);
  const parentByTarget = buildParentByTarget(edges, nodePaths);
  const roots = nodes.filter((node) => !parentByTarget.has(node.path)).map((node) => node.path);
  const positions = new Map<string, TopologyNodePosition>();
  const visiting = new Set<string>();
  let nextLeafX = 0;

  function visit(path: string, depth: number): number {
    if (positions.has(path)) {
      return positions.get(path)?.x ?? 0;
    }
    if (visiting.has(path)) {
      const cycleX = nextLeafX;
      nextLeafX += horizontalGap;
      positions.set(path, { x: cycleX, y: topPadding + depth * verticalGap });
      return cycleX;
    }

    visiting.add(path);

    const children = childrenBySource.get(path) ?? [];
    let x: number;
    if (children.length === 0) {
      x = nextLeafX;
      nextLeafX += horizontalGap;
    } else {
      const childXs = children.map((childPath) => visit(childPath, depth + 1));
      x = (childXs[0] + childXs[childXs.length - 1]) / 2;
    }

    visiting.delete(path);
    positions.set(path, { x, y: topPadding + depth * verticalGap });
    return x;
  }

  for (const root of roots) {
    visit(root, 0);
  }

  for (const node of nodes) {
    visit(node.path, 0);
  }

  for (const position of positions.values()) {
    position.x += leftPadding;
  }

  return positions;
}

function buildChildrenBySource(edges: SupervisorEdge[], nodePaths: Set<string>): Map<string, string[]> {
  const grouped = new Map<string, SupervisorEdge[]>();

  for (const edge of edges) {
    if (edge.kind !== "parent_child") {
      continue;
    }
    if (!nodePaths.has(edge.source_path) || !nodePaths.has(edge.target_path)) {
      continue;
    }
    const siblings = grouped.get(edge.source_path) ?? [];
    siblings.push(edge);
    grouped.set(edge.source_path, siblings);
  }

  const result = new Map<string, string[]>();
  for (const [sourcePath, siblings] of grouped.entries()) {
    result.set(
      sourcePath,
      [...siblings]
        .sort((left, right) => {
          const orderDiff = left.order - right.order;
          return orderDiff === 0 ? left.target_path.localeCompare(right.target_path) : orderDiff;
        })
        .map((edge) => edge.target_path)
    );
  }

  return result;
}

function buildParentByTarget(edges: SupervisorEdge[], nodePaths: Set<string>): Map<string, string> {
  const result = new Map<string, string>();

  for (const edge of edges) {
    if (edge.kind !== "parent_child") {
      continue;
    }
    if (!nodePaths.has(edge.source_path) || !nodePaths.has(edge.target_path)) {
      continue;
    }
    result.set(edge.target_path, edge.source_path);
  }

  return result;
}
