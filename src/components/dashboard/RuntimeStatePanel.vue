<script setup lang="ts">
import { computed } from "vue";
import { ServerCog } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { Box, List, ListItem, Section, Text } from "@/components/layout";
import Badge from "@/components/ui/Badge.vue";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProtocolLabels } from "@/i18n/protocolLabels";
import { stateStore } from "@/state/stateStore";
import type { LifecycleState } from "@/types/protocol";

const { t } = useI18n();
const protocolLabels = useProtocolLabels();
const runtimeStates = computed(() => stateStore.selectedDashboardState.value?.runtime_state ?? []);

function stateVariant(state?: LifecycleState): "success" | "warning" | "danger" | "muted" {
  if (state === "running" || state === "completed") {
    return "success";
  }
  if (state === "starting" || state === "paused" || state === "restarting") {
    return "warning";
  }
  if (state === "failed" || state === "quarantined" || state === "stopped") {
    return "danger";
  }
  return "muted";
}
</script>

<template>
  <Section aria-label="runtime state" data-testid="runtime-state-panel">
    <Empty v-if="runtimeStates.length === 0" class="min-h-48 rounded-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ServerCog aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{{ t("runtime.emptyTitle") }}</EmptyTitle>
        <EmptyDescription>{{ t("runtime.emptyDescription") }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <ScrollArea v-else class="max-h-[28rem] rounded-md border">
      <List class="divide-y" data-testid="runtime-state-list">
        <ListItem
          v-for="runtimeState in runtimeStates"
          :key="runtimeState.child_path"
          class="grid gap-3 p-3 text-sm lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
        >
          <Box class="min-w-0">
            <Text class="truncate font-semibold text-foreground">{{ runtimeState.child_path }}</Text>
            <Text class="mt-1 text-xs text-muted-foreground">
              {{ t("runtime.generationAndAttempt", { generation: runtimeState.generation, attempt: runtimeState.attempt }) }}
            </Text>
          </Box>
          <Badge :variant="stateVariant(runtimeState.lifecycle_state)">
            {{ protocolLabels.lifecycle(runtimeState.lifecycle_state) }}
          </Badge>
          <Badge variant="outline">{{ protocolLabels.health(runtimeState.health) }}</Badge>
          <Badge variant="muted">
            {{ t("runtime.restartCount", { count: runtimeState.restart_count }) }}
          </Badge>
        </ListItem>
      </List>
    </ScrollArea>
  </Section>
</template>
