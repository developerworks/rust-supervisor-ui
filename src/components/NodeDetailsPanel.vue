<script setup lang="ts">
import { computed } from "vue";
import { FileText, ShieldAlert } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import Badge from "@/components/ui/Badge.vue";
import Card from "@/components/ui/Card.vue";
import { useProtocolLabels } from "@/i18n/protocolLabels";
import { eventStore } from "@/state/eventStore";
import { stateStore } from "@/state/stateStore";
import type { LifecycleState } from "@/types/protocol";

const { t } = useI18n();
const protocolLabels = useProtocolLabels();
const detail = computed(() => stateStore.selectedNodeDetail.value);
const selectedTargetId = computed(() => stateStore.state.selectedTargetId);
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
  <Card aria-label="node detail">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="muted-label">{{ t("sections.nodeDetail") }}</p>
        <h2 class="panel-title">{{ t("sections.nodeTitle") }}</h2>
      </div>
      <FileText class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </div>

    <div v-if="!detail" class="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
      {{ t("nodeDetail.chooseNode") }}
    </div>

    <div v-else class="flex flex-col gap-4" data-testid="node-detail">
      <div>
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="truncate text-base font-semibold leading-6 text-foreground">{{ detail.node.name }}</h3>
            <p class="truncate text-xs text-muted-foreground">{{ detail.node.path }}</p>
          </div>
          <Badge :variant="stateVariant(detail.runtimeState?.lifecycle_state)">
            {{ detail.runtimeState ? protocolLabels.lifecycle(detail.runtimeState.lifecycle_state) : protocolLabels.stateSummary(detail.node.state_summary) }}
          </Badge>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <Badge v-for="tag in detail.node.tags" :key="tag" variant="outline">{{ tag }}</Badge>
          <Badge variant="secondary">{{ protocolLabels.criticality(detail.node.criticality) }}</Badge>
        </div>
      </div>

      <dl v-if="detail.runtimeState" class="grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-md bg-muted p-3">
          <dt class="muted-label">{{ t("nodeDetail.health") }}</dt>
          <dd class="mt-1 font-semibold">{{ protocolLabels.health(detail.runtimeState.health) }}</dd>
        </div>
        <div class="rounded-md bg-muted p-3">
          <dt class="muted-label">{{ t("nodeDetail.readiness") }}</dt>
          <dd class="mt-1 font-semibold">{{ protocolLabels.readiness(detail.runtimeState.readiness) }}</dd>
        </div>
        <div class="rounded-md bg-muted p-3">
          <dt class="muted-label">{{ t("nodeDetail.restartCount") }}</dt>
          <dd class="mt-1 font-semibold">{{ detail.runtimeState.restart_count }}</dd>
        </div>
        <div class="rounded-md bg-muted p-3">
          <dt class="muted-label">{{ t("nodeDetail.shutdownState") }}</dt>
          <dd class="mt-1 font-semibold">{{ protocolLabels.stateSummary(detail.runtimeState.shutdown_state) }}</dd>
        </div>
      </dl>

      <div v-if="detail.runtimeState?.last_failure || detail.runtimeState?.last_policy_decision" class="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
        <div class="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
          <ShieldAlert class="h-4 w-4" aria-hidden="true" />
          {{ t("nodeDetail.recentDiagnostics") }}
        </div>
        <p v-if="detail.runtimeState.last_failure" class="text-sm leading-5 text-amber-950 dark:text-amber-100">
          {{ t("nodeDetail.lastFailure", { value: detail.runtimeState.last_failure }) }}
        </p>
        <p v-if="detail.runtimeState.last_policy_decision" class="text-sm leading-5 text-amber-950 dark:text-amber-100">
          {{ t("nodeDetail.lastPolicyDecision", { value: detail.runtimeState.last_policy_decision }) }}
        </p>
      </div>

      <div>
        <p class="mb-2 text-sm font-semibold">{{ t("nodeDetail.recentEvents") }}</p>
        <div v-if="relatedEvents.length === 0" class="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          {{ t("nodeDetail.noRecentEvents") }}
        </div>
        <ul v-else class="flex flex-col gap-2">
          <li v-for="event in relatedEvents" :key="event.sequence" class="rounded-md border bg-card p-3 text-xs">
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold">{{ protocolLabels.eventType(event.event_type) }}</span>
              <Badge :variant="event.severity === 'error' ? 'danger' : event.severity === 'warning' ? 'warning' : 'muted'">
                {{ protocolLabels.severity(event.severity) }}
              </Badge>
            </div>
            <p class="mt-1 text-muted-foreground">{{ t("nodeDetail.sequenceAndCorrelation", { sequence: event.sequence, correlationId: event.correlation_id }) }}</p>
          </li>
        </ul>
      </div>
    </div>
  </Card>
</template>
