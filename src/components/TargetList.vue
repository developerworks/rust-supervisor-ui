<script setup lang="ts">
import { computed } from "vue";
import { Activity, AlertTriangle, Ban, Cable, RefreshCcw, Server } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import Badge from "@/components/ui/Badge.vue";
import Card from "@/components/ui/Card.vue";
import { useProtocolLabels } from "@/i18n/protocolLabels";
import { stateStore } from "@/state/stateStore";
import type { ConnectionState, SupportedCommand } from "@/types/protocol";

const { t } = useI18n();
const protocolLabels = useProtocolLabels();
const targets = computed(() => stateStore.state.targets);
const selectedTargetId = computed(() => stateStore.state.selectedTargetId);

function statusLabel(state: ConnectionState): string {
  return t(`targetList.status.${state}`);
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

function commandList(commands: SupportedCommand[]): string {
  return commands.map((command) => protocolLabels.command(command.name)).join(", ");
}
</script>

<template>
  <Card aria-label="target list">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="muted-label">{{ t("sections.targetList") }}</p>
        <h2 class="panel-title">{{ t("sections.targetTitle") }}</h2>
      </div>
      <Server class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </div>

    <div v-if="targets.length === 0" class="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
      {{ t("targetList.waiting") }}
    </div>

    <div class="flex flex-col gap-2" data-testid="target-list">
      <button
        v-for="target in targets"
        :key="target.target_id"
        type="button"
        class="w-full rounded-md border p-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="target.target_id === selectedTargetId ? 'border-primary bg-secondary' : 'border-border bg-card'"
        @click="stateStore.selectTarget(target.target_id)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-foreground">{{ target.display_name }}</p>
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
          <span class="truncate">{{ t("targetList.commands", { commands: commandList(target.supported_commands) }) }}</span>
        </div>
      </button>
    </div>
  </Card>
</template>
