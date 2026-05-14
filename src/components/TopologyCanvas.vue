<script setup lang="ts">
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { VueFlow, type Node, type NodeDragEvent, type NodeMouseEvent, useVueFlow } from "@vue-flow/core";
import { AlertTriangle, Info, Maximize2, Network, RefreshCw, Search } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { Box, Grid, InlineGroup, InteractiveRow, PanelHeader, Text } from "@/components/layout";
import OffsetBezierEdge from "@/components/topology/OffsetBezierEdge.vue";
import { buildTopologyFlowEdges, topologyEdgeType } from "@/components/topology/edgeLayout";
import { buildTopologyNodePositions } from "@/components/topology/nodeLayout";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import Card from "@/components/ui/Card.vue";
import Input from "@/components/ui/Input.vue";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { useProtocolLabels } from "@/i18n/protocolLabels";
import { displayTaskPath } from "@/lib/taskPath";
import { stateStore } from "@/state/stateStore";
import type { LifecycleState, SupervisorNode } from "@/types/protocol";

interface StoredTopologyNodePosition {
  x: number;
  y: number;
}

const topologyPositionStorageKey = "rust-supervisor-ui:topology-node-positions";
const { t } = useI18n();
const protocolLabels = useProtocolLabels();
const { fitView } = useVueFlow();
const state = computed(() => stateStore.selectedDashboardState.value);
const selectedTargetId = computed(() => stateStore.state.selectedTargetId);
const selectedNodePath = computed(() => stateStore.state.selectedNodePath);
const searchQuery = ref("");
const failedOnly = ref(false);
const legendOpen = ref(false);
const layoutVersion = ref(0);
const canvasFocused = ref(false);
const manualNodePositions = ref(loadManualNodePositions());
let resizeFitTimer: number | null = null;
const edgeTypes = markRaw({
  [topologyEdgeType]: OffsetBezierEdge
});

const visibleTopologyNodes = computed(() => {
  const topology = state.value?.topology;
  if (!topology) {
    return [];
  }
  const query = searchQuery.value.trim().toLowerCase();
  return topology.nodes.filter((node) => {
    const renderedPath = displayTaskPath(node.path).toLowerCase();
    const matchesSearch =
      !query ||
      node.name.toLowerCase().includes(query) ||
      node.path.toLowerCase().includes(query) ||
      renderedPath.includes(query);
    const matchesFailure = !failedOnly.value || isFailureState(node.state_summary);
    return matchesSearch && matchesFailure;
  });
});

const visibleNodePaths = computed(() => new Set(visibleTopologyNodes.value.map((node) => node.path)));

const flowNodePositions = computed(() => {
  const topology = state.value?.topology;
  if (!topology) {
    return new Map<string, { x: number; y: number }>();
  }
  return buildTopologyNodePositions(visibleTopologyNodes.value, topology.edges);
});

const flowNodes = computed<Node[]>(() => {
  if (!state.value) {
    return [];
  }
  return visibleTopologyNodes.value.map((node, index) => {
    const manualPosition = manualNodePositions.value.get(manualPositionKey(node.path));
    const autoPosition = flowNodePositions.value.get(node.path) ?? { x: 80 + index * 240, y: 30 };
    return {
      id: node.path,
      label: nodeLabel(node),
      position: manualPosition ?? autoPosition,
      data: { label: nodeLabel(node) },
      class: [
        "supervisor-node",
        node.kind === "root_supervisor" ? "supervisor-kind" : "worker-kind",
        stateClass(node.state_summary as LifecycleState),
        selectedNodePath.value === node.path ? "selected" : ""
      ].join(" ")
    };
  });
});

const flowEdges = computed(() => {
  const topology = state.value?.topology;
  if (!topology) {
    return [];
  }
  return buildTopologyFlowEdges(topology.edges, visibleNodePaths.value, t("topology.dependencyLabel"));
});

function nodeLabel(node: SupervisorNode): string {
  return `${node.name}\n${protocolLabels.stateSummary(node.state_summary)}`;
}

function stateClass(state: LifecycleState): string {
  if (state === "failed" || state === "quarantined") {
    return "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200";
  }
  if (state === "restarting" || state === "paused") {
    return "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200";
  }
  if (state === "running") {
    return "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
  }
  return "border-border bg-card text-foreground";
}

function isFailureState(state: string): boolean {
  return state === "failed" || state === "quarantined" || state === "stopped";
}

function selectFlowNode(event: NodeMouseEvent): void {
  stateStore.selectNode(event.node.id);
}

function manualPositionKey(nodePath: string): string {
  return `${selectedTargetId.value ?? "unselected"}:${nodePath}`;
}

function loadManualNodePositions(): Map<string, StoredTopologyNodePosition> {
  try {
    const saved = localStorage.getItem(topologyPositionStorageKey);
    if (!saved) {
      return new Map();
    }
    const parsed = JSON.parse(saved) as Record<string, StoredTopologyNodePosition>;
    const positions = new Map<string, StoredTopologyNodePosition>();
    for (const [key, position] of Object.entries(parsed)) {
      if (Number.isFinite(position.x) && Number.isFinite(position.y)) {
        positions.set(key, { x: position.x, y: position.y });
      }
    }
    return positions;
  } catch {
    return new Map();
  }
}

function persistManualNodePositions(positions: Map<string, StoredTopologyNodePosition>): void {
  try {
    localStorage.setItem(topologyPositionStorageKey, JSON.stringify(Object.fromEntries(positions)));
  } catch {
    // 布局持久化只是体验增强, 私密浏览或存储策略拒绝写入时可以忽略.
  }
}

function storeManualNodePosition(event: NodeDragEvent): void {
  const nextPositions = new Map(manualNodePositions.value);
  nextPositions.set(manualPositionKey(event.node.id), {
    x: event.node.position.x,
    y: event.node.position.y
  });
  manualNodePositions.value = nextPositions;
  persistManualNodePositions(nextPositions);
}

function clearManualNodePositionsForCurrentTarget(): void {
  const targetId = selectedTargetId.value;
  if (!targetId) {
    manualNodePositions.value = new Map();
    persistManualNodePositions(manualNodePositions.value);
    return;
  }
  const nextPositions = new Map(manualNodePositions.value);
  for (const node of visibleTopologyNodes.value) {
    nextPositions.delete(`${targetId}:${node.path}`);
  }
  manualNodePositions.value = nextPositions;
  persistManualNodePositions(nextPositions);
}

function handleGlobalPointerDown(event: PointerEvent): void {
  const target = event.target;
  canvasFocused.value = target instanceof Element && Boolean(target.closest('[data-testid="topology-canvas"]'));
}

function clearTopologyCanvasFocus(): void {
  canvasFocused.value = false;
}

async function fitTopologyView(): Promise<void> {
  await nextTick();
  fitView({ padding: 0.18, duration: 200 });
}

function scheduleFitTopologyView(): void {
  if (resizeFitTimer !== null) {
    window.clearTimeout(resizeFitTimer);
  }
  resizeFitTimer = window.setTimeout(() => {
    resizeFitTimer = null;
    void fitTopologyView();
  }, 120);
}

function clearScheduledFitTopologyView(): void {
  if (resizeFitTimer !== null) {
    window.clearTimeout(resizeFitTimer);
    resizeFitTimer = null;
  }
}

async function relayoutTopology(): Promise<void> {
  clearManualNodePositionsForCurrentTarget();
  layoutVersion.value += 1;
  await fitTopologyView();
}

onMounted(() => {
  window.addEventListener("pointerdown", handleGlobalPointerDown, true);
  window.addEventListener("resize", scheduleFitTopologyView);
  window.addEventListener("blur", clearTopologyCanvasFocus);
});

onBeforeUnmount(() => {
  window.removeEventListener("pointerdown", handleGlobalPointerDown, true);
  window.removeEventListener("resize", scheduleFitTopologyView);
  window.removeEventListener("blur", clearTopologyCanvasFocus);
  clearScheduledFitTopologyView();
});
</script>

<template>
  <Card class="min-h-[33rem]" aria-label="topology canvas">
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.topologyCanvas')"
      :title="t('sections.topologyTitle')"
    >
      <Network class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </PanelHeader>

    <Empty v-if="!state" class="min-h-[26rem] rounded-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Network aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{{ t("topology.emptyTitle") }}</EmptyTitle>
        <EmptyDescription>{{ t("topology.emptyDescription") }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <template v-else>
      <InlineGroup align="start" justify="between" class="mb-3 flex-col gap-3 lg:flex-row lg:items-center">
        <Box class="relative min-w-0 flex-1">
          <Search class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            v-model="searchQuery"
            class="pl-9"
            :placeholder="t('topology.searchPlaceholder')"
            aria-label="node search"
          />
        </Box>
        <InlineGroup wrap gap="sm">
          <Button type="button" variant="outline" size="sm" @click="fitTopologyView">
            <Maximize2 aria-hidden="true" />
            {{ t("topology.fitView") }}
          </Button>
          <Button type="button" variant="outline" size="sm" @click="relayoutTopology">
            <RefreshCw aria-hidden="true" />
            {{ t("topology.relayout") }}
          </Button>
          <Button
            type="button"
            :variant="failedOnly ? 'warning' : 'outline'"
            size="sm"
            @click="failedOnly = !failedOnly"
          >
            <AlertTriangle aria-hidden="true" />
            {{ failedOnly ? t("topology.showAll") : t("topology.showFailedOnly") }}
          </Button>
          <Button type="button" variant="outline" size="sm" @click="legendOpen = !legendOpen">
            <Info aria-hidden="true" />
            {{ t("topology.legend") }}
          </Button>
        </InlineGroup>
      </InlineGroup>

      <InlineGroup v-if="legendOpen" wrap gap="sm" class="mb-3 rounded-md border bg-muted p-3 text-xs">
        <Badge variant="outline">{{ t("topology.legendSupervisor") }}</Badge>
        <Badge variant="secondary">{{ t("topology.legendWorker") }}</Badge>
        <Badge variant="success">{{ t("lifecycle.running") }}</Badge>
        <Badge variant="warning">{{ t("lifecycle.restarting") }}</Badge>
        <Badge variant="danger">{{ t("lifecycle.failed") }}</Badge>
        <Badge variant="muted">{{ t("targetList.status.disconnected") }}</Badge>
      </InlineGroup>

      <Empty v-if="visibleTopologyNodes.length === 0" class="min-h-[26rem] rounded-md border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{{ t("topology.noMatchTitle") }}</EmptyTitle>
          <EmptyDescription>{{ t("topology.noMatchDescription") }}</EmptyDescription>
        </EmptyHeader>
      </Empty>

      <Box
        v-else
        class="h-[26rem] overflow-hidden rounded-md border bg-muted transition focus-visible:outline-none"
        :class="canvasFocused ? 'border-primary ring-2 ring-primary/30' : 'border-border'"
        data-testid="topology-canvas"
        tabindex="0"
        @keydown.escape.stop="clearTopologyCanvasFocus"
      >
        <VueFlow
          :key="layoutVersion"
          :nodes="flowNodes"
          :edges="flowEdges"
          :edge-types="edgeTypes"
          :fit-view-on-init="true"
          :min-zoom="0.55"
          :max-zoom="1.25"
          :prevent-scrolling="canvasFocused"
          :zoom-on-pinch="canvasFocused"
          :zoom-on-scroll="canvasFocused"
          @node-click="selectFlowNode"
          @node-drag-stop="storeManualNodePosition"
        >
          <Background pattern-color="#cbd5e1" :gap="18" />
          <Controls position="bottom-right" />
        </VueFlow>
      </Box>

      <Grid class="mt-3 grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        <InteractiveRow
          v-for="node in visibleTopologyNodes"
          :key="node.path"
          class="rounded-md border px-3 py-2 text-left text-xs transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="node.path === selectedNodePath ? 'border-primary bg-secondary' : 'border-border bg-card'"
          @click="stateStore.selectNode(node.path)"
        >
          <Text as="span" class="block font-semibold text-foreground">{{ node.name }}</Text>
          <Text as="span" class="block truncate text-muted-foreground">{{ displayTaskPath(node.path) }}</Text>
        </InteractiveRow>
      </Grid>
    </template>
  </Card>
</template>
