<script setup lang="ts">
import { computed } from "vue";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { VueFlow, type Edge, type Node, type NodeMouseEvent } from "@vue-flow/core";
import { Network } from "lucide-vue-next";
import Card from "@/components/ui/Card.vue";
import { snapshotStore } from "@/state/snapshotStore";
import type { LifecycleState, SupervisorNode } from "@/types/protocol";

const snapshot = computed(() => snapshotStore.selectedSnapshot.value);
const selectedNodePath = computed(() => snapshotStore.state.selectedNodePath);

const flowNodes = computed<Node[]>(() => {
  const topology = snapshot.value?.topology;
  if (!topology) {
    return [];
  }
  return topology.nodes.map((node, index) => ({
    id: node.path,
    label: nodeLabel(node),
    position: positionFor(index),
    data: { label: nodeLabel(node) },
    class: [
      "supervisor-node",
      stateClass(node.state_summary as LifecycleState),
      selectedNodePath.value === node.path ? "selected" : ""
    ].join(" ")
  }));
});

const flowEdges = computed<Edge[]>(() => {
  const topology = snapshot.value?.topology;
  if (!topology) {
    return [];
  }
  return topology.edges.map((edge) => ({
    id: edge.edge_id,
    source: edge.source_path,
    target: edge.target_path,
    animated: edge.kind === "dependency",
    label: edge.kind === "dependency" ? "depends" : undefined,
    type: "smoothstep"
  }));
});

function positionFor(index: number): { x: number; y: number } {
  if (index === 0) {
    return { x: 320, y: 30 };
  }
  const column = (index - 1) % 3;
  const row = Math.floor((index - 1) / 3);
  return { x: 80 + column * 260, y: 160 + row * 150 };
}

function nodeLabel(node: SupervisorNode): string {
  return `${node.name}\n${node.state_summary}`;
}

function stateClass(state: LifecycleState): string {
  if (state === "failed" || state === "quarantined") {
    return "border-red-300 bg-red-50 text-red-900";
  }
  if (state === "restarting" || state === "paused") {
    return "border-amber-300 bg-amber-50 text-amber-900";
  }
  if (state === "running") {
    return "border-emerald-300 bg-emerald-50 text-emerald-900";
  }
  return "border-slate-300 bg-white text-slate-900";
}

function selectFlowNode(event: NodeMouseEvent): void {
  snapshotStore.selectNode(event.node.id);
}
</script>

<template>
  <Card class="min-h-[33rem]" aria-label="topology canvas">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="muted-label">topology canvas(拓扑画布)</p>
        <h2 class="panel-title">监督拓扑</h2>
      </div>
      <Network class="h-5 w-5 text-slate-500" aria-hidden="true" />
    </div>

    <div v-if="!snapshot" class="flex h-[26rem] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
      等待 snapshot(快照).
    </div>

    <div v-else class="h-[26rem] overflow-hidden rounded-md border bg-slate-50" data-testid="topology-canvas">
      <VueFlow
        :nodes="flowNodes"
        :edges="flowEdges"
        :fit-view-on-init="true"
        :min-zoom="0.55"
        :max-zoom="1.25"
        @node-click="selectFlowNode"
      >
        <Background pattern-color="#cbd5e1" :gap="18" />
        <Controls position="bottom-right" />
      </VueFlow>
    </div>

    <div v-if="snapshot" class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="node in snapshot.topology.nodes"
        :key="node.path"
        type="button"
        class="rounded-md border px-3 py-2 text-left text-xs transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="node.path === selectedNodePath ? 'border-primary bg-blue-50' : 'border-border bg-card'"
        @click="snapshotStore.selectNode(node.path)"
      >
        <span class="block font-semibold text-slate-950">{{ node.name }}</span>
        <span class="block truncate text-muted-foreground">{{ node.path }}</span>
      </button>
    </div>
  </Card>
</template>
