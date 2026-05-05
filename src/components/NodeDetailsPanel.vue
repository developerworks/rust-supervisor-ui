<script setup lang="ts">
import { computed } from "vue";
import { FileText, ShieldAlert } from "lucide-vue-next";
import Badge from "@/components/ui/Badge.vue";
import Card from "@/components/ui/Card.vue";
import { eventStore } from "@/state/eventStore";
import { snapshotStore } from "@/state/snapshotStore";
import type { LifecycleState } from "@/types/protocol";

const detail = computed(() => snapshotStore.selectedNodeDetail.value);
const selectedTargetId = computed(() => snapshotStore.state.selectedTargetId);
const relatedEvents = computed(() => {
  const node = detail.value?.node;
  if (!node || !selectedTargetId.value) {
    return [];
  }
  return eventStore.state.events
    .filter((event) => event.target_id === selectedTargetId.value && event.target_path === node.path)
    .slice(-4)
    .reverse();
});

function stateVariant(state?: LifecycleState): "success" | "warning" | "danger" | "muted" {
  if (state === "running" || state === "completed") {
    return "success";
  }
  if (state === "restarting" || state === "paused" || state === "starting") {
    return "warning";
  }
  if (state === "failed" || state === "quarantined" || state === "stopped") {
    return "danger";
  }
  return "muted";
}
</script>

<template>
  <Card class="h-full" aria-label="node detail">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="muted-label">node detail(节点详情)</p>
        <h2 class="panel-title">运行状态</h2>
      </div>
      <FileText class="h-5 w-5 text-slate-500" aria-hidden="true" />
    </div>

    <div v-if="!detail" class="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
      请选择监督节点.
    </div>

    <div v-else class="space-y-4" data-testid="node-detail">
      <div>
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="truncate text-base font-semibold leading-6 text-slate-950">{{ detail.node.name }}</h3>
            <p class="truncate text-xs text-muted-foreground">{{ detail.node.path }}</p>
          </div>
          <Badge :variant="stateVariant(detail.runtimeState?.lifecycle_state)">
            {{ detail.runtimeState?.lifecycle_state ?? detail.node.state_summary }}
          </Badge>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <Badge v-for="tag in detail.node.tags" :key="tag" variant="outline">{{ tag }}</Badge>
          <Badge variant="secondary">{{ detail.node.criticality }}</Badge>
        </div>
      </div>

      <dl v-if="detail.runtimeState" class="grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-md bg-muted p-3">
          <dt class="muted-label">health(健康状态)</dt>
          <dd class="mt-1 font-semibold">{{ detail.runtimeState.health }}</dd>
        </div>
        <div class="rounded-md bg-muted p-3">
          <dt class="muted-label">readiness(就绪状态)</dt>
          <dd class="mt-1 font-semibold">{{ detail.runtimeState.readiness }}</dd>
        </div>
        <div class="rounded-md bg-muted p-3">
          <dt class="muted-label">restart count(重启次数)</dt>
          <dd class="mt-1 font-semibold">{{ detail.runtimeState.restart_count }}</dd>
        </div>
        <div class="rounded-md bg-muted p-3">
          <dt class="muted-label">shutdown state(关闭状态)</dt>
          <dd class="mt-1 font-semibold">{{ detail.runtimeState.shutdown_state }}</dd>
        </div>
      </dl>

      <div v-if="detail.runtimeState?.last_failure || detail.runtimeState?.last_policy_decision" class="rounded-md border border-amber-200 bg-amber-50 p-3">
        <div class="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
          <ShieldAlert class="h-4 w-4" aria-hidden="true" />
          最近诊断
        </div>
        <p v-if="detail.runtimeState.last_failure" class="text-sm leading-5 text-amber-950">
          last failure(最近失败): {{ detail.runtimeState.last_failure }}
        </p>
        <p v-if="detail.runtimeState.last_policy_decision" class="text-sm leading-5 text-amber-950">
          last policy decision(最近策略决定): {{ detail.runtimeState.last_policy_decision }}
        </p>
      </div>

      <div>
        <p class="mb-2 text-sm font-semibold">最近事件</p>
        <div v-if="relatedEvents.length === 0" class="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          当前节点没有 recent event(最近事件).
        </div>
        <ul v-else class="space-y-2">
          <li v-for="event in relatedEvents" :key="event.sequence" class="rounded-md border bg-card p-3 text-xs">
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold">{{ event.event_type }}</span>
              <Badge :variant="event.severity === 'error' ? 'danger' : event.severity === 'warning' ? 'warning' : 'muted'">
                {{ event.severity }}
              </Badge>
            </div>
            <p class="mt-1 text-muted-foreground">sequence(序号): {{ event.sequence }}, correlation id(关联标识): {{ event.correlation_id }}</p>
          </li>
        </ul>
      </div>
    </div>
  </Card>
</template>
