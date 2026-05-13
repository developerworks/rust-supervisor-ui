<script setup lang="ts">
import { computed } from "vue";
import { Activity, AlertTriangle, Ban, Cable, RefreshCcw, Server } from "lucide-vue-next";
import Badge from "@/components/ui/Badge.vue";
import Card from "@/components/ui/Card.vue";
import { stateStore } from "@/state/stateStore";
import type { ConnectionState } from "@/types/protocol";

const targets = computed(() => stateStore.state.targets);
const selectedTargetId = computed(() => stateStore.state.selectedTargetId);

function statusLabel(state: ConnectionState): string {
  const labels: Record<ConnectionState, string> = {
    registered: "已注册",
    disconnected: "未连接",
    connecting: "连接中",
    connected: "已连接",
    reconnecting: "重连中",
    unavailable: "不可用",
    expired: "已过期"
  };
  return labels[state];
}

function statusVariant(state: ConnectionState): "success" | "warning" | "danger" | "muted" {
  if (state === "connected") {
    return "success";
  }
  if (state === "reconnecting" || state === "connecting") {
    return "warning";
  }
  if (state === "unavailable" || state === "expired") {
    return "danger";
  }
  return "muted";
}

function statusIcon(state: ConnectionState) {
  if (state === "connected") {
    return Activity;
  }
  if (state === "reconnecting" || state === "connecting") {
    return RefreshCcw;
  }
  if (state === "unavailable" || state === "expired") {
    return Ban;
  }
  return Cable;
}
</script>

<template>
  <Card class="h-full" aria-label="target list">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="muted-label">target list(目标列表)</p>
        <h2 class="panel-title">目标进程</h2>
      </div>
      <Server class="h-5 w-5 text-slate-500" aria-hidden="true" />
    </div>

    <div v-if="targets.length === 0" class="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
      等待 target_list(目标列表) 消息.
    </div>

    <div class="space-y-2" data-testid="target-list">
      <button
        v-for="target in targets"
        :key="target.target_id"
        type="button"
        class="w-full rounded-md border p-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="target.target_id === selectedTargetId ? 'border-primary bg-blue-50' : 'border-border bg-card'"
        @click="stateStore.selectTarget(target.target_id)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-slate-950">{{ target.display_name }}</p>
            <p class="mt-0.5 truncate text-xs text-muted-foreground">{{ target.target_id }}</p>
          </div>
          <Badge :variant="statusVariant(target.connection_state)">
            <component :is="statusIcon(target.connection_state)" class="mr-1 h-3 w-3" aria-hidden="true" />
            {{ statusLabel(target.connection_state) }}
          </Badge>
        </div>
        <div class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle
            v-if="target.connection_state === 'unavailable'"
            class="h-3.5 w-3.5 text-red-600"
            aria-hidden="true"
          />
          <span class="truncate">commands(命令): {{ target.supported_commands.map((command) => command.name).join(", ") }}</span>
        </div>
      </button>
    </div>
  </Card>
</template>
