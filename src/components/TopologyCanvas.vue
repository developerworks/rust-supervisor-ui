<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { VueFlow, type Edge, type Node, type NodeMouseEvent, useVueFlow } from "@vue-flow/core";
import { AlertTriangle, Info, Maximize2, Network, RefreshCw, Search } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { Box, Grid, InlineGroup, InteractiveRow, PanelHeader, Text } from "@/components/layout";
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
import { stateStore } from "@/state/stateStore";
import type { LifecycleState, SupervisorNode } from "@/types/protocol";

const { t } = useI18n();
const protocolLabels = useProtocolLabels();
const { fitView } = useVueFlow();
const state = computed(() => stateStore.selectedDashboardState.value);
const selectedNodePath = computed(() => stateStore.state.selectedNodePath);
const searchQuery = ref("");
const failedOnly = ref(false);
const legendOpen = ref(false);
const layoutVersion = ref(0);

const visibleTopologyNodes = computed(() => {
  const topology = state.value?.topology;
  if (!topology) {
    return [];
  }
  const query = searchQuery.value.trim().toLowerCase();
  return topology.nodes.filter((node) => {
    const matchesSearch =
      !query ||
      node.name.toLowerCase().includes(query) ||
      node.path.toLowerCase().includes(query);
    const matchesFailure = !failedOnly.value || isFailureState(node.state_summary);
    return matchesSearch && matchesFailure;
  });
});

const visibleNodePaths = computed(() => new Set(visibleTopologyNodes.value.map((node) => node.path)));

const flowNodes = computed<Node[]>(() => {
  if (!state.value) {
    return [];
  }
  return visibleTopologyNodes.value.map((node, index) => ({
    id: node.path,
    label: nodeLabel(node),
    position: positionFor(index + layoutVersion.value * 0),
    data: { label: nodeLabel(node) },
    class: [
      "supervisor-node",
      node.kind === "root_supervisor" ? "supervisor-kind" : "worker-kind",
      stateClass(node.state_summary as LifecycleState),
      selectedNodePath.value === node.path ? "selected" : ""
    ].join(" ")
  }));
});

const flowEdges = computed<Edge[]>(() => {
  const topology = state.value?.topology;
  if (!topology) {
    return [];
  }
  return topology.edges
    .filter((edge) => visibleNodePaths.value.has(edge.source_path) && visibleNodePaths.value.has(edge.target_path))
    .map((edge) => ({
      id: edge.edge_id,
      source: edge.source_path,
      target: edge.target_path,
      animated: edge.kind === "dependency",
      label: edge.kind === "dependency" ? t("topology.dependencyLabel") : undefined,
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

async function fitTopologyView(): Promise<void> {
  await nextTick();
  fitView({ padding: 0.18, duration: 200 });
}

async function relayoutTopology(): Promise<void> {
  layoutVersion.value += 1;
  await fitTopologyView();
}
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

      <Box v-else class="h-[26rem] overflow-hidden rounded-md border bg-muted" data-testid="topology-canvas">
        <VueFlow
          :key="layoutVersion"
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
          <Text as="span" class="block truncate text-muted-foreground">{{ node.path }}</Text>
        </InteractiveRow>
      </Grid>
    </template>
  </Card>
</template>
