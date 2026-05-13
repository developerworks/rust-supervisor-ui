<script setup lang="ts">
import { computed } from "vue";
import { ServerCog } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import {
  Box,
  DescriptionItem,
  DescriptionList,
  InlineGroup,
  List,
  ListItem,
  PanelHeader,
  Section,
  Text
} from "@/components/layout";
import Badge from "@/components/ui/Badge.vue";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
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
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.runtime')"
      :title="t('sections.runtimeTitle')"
    >
      <ServerCog class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </PanelHeader>

    <Empty v-if="runtimeStates.length === 0" class="min-h-48 rounded-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ServerCog aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{{ t("runtime.emptyTitle") }}</EmptyTitle>
        <EmptyDescription>{{ t("runtime.emptyDescription") }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <Box v-else class="rounded-md border">
      <List class="divide-y" data-testid="runtime-state-list">
        <ListItem
          v-for="runtimeState in runtimeStates"
          :key="runtimeState.child_path"
          class="flex flex-col gap-3 p-3 text-sm"
        >
          <Box class="min-w-0">
            <Text class="break-all font-semibold leading-snug text-foreground">{{ runtimeState.child_path }}</Text>
            <Text class="mt-1 text-xs text-muted-foreground">
              {{ t("runtime.generationAndAttempt", { generation: runtimeState.generation, attempt: runtimeState.attempt }) }}
            </Text>
          </Box>
          <InlineGroup wrap gap="sm" data-testid="runtime-state-badges">
            <Badge :variant="stateVariant(runtimeState.lifecycle_state)">
              {{ protocolLabels.lifecycle(runtimeState.lifecycle_state) }}
            </Badge>
            <Badge variant="outline">{{ protocolLabels.health(runtimeState.health) }}</Badge>
            <Badge variant="outline">{{ protocolLabels.readiness(runtimeState.readiness) }}</Badge>
            <Badge variant="muted">
              {{ t("runtime.restartCount", { count: runtimeState.restart_count }) }}
            </Badge>
          </InlineGroup>
          <DescriptionList class="grid gap-3 text-sm sm:grid-cols-2">
            <DescriptionItem :label="t('nodeDetail.health')">
              {{ protocolLabels.health(runtimeState.health) }}
            </DescriptionItem>
            <DescriptionItem :label="t('nodeDetail.readiness')">
              {{ protocolLabels.readiness(runtimeState.readiness) }}
            </DescriptionItem>
            <DescriptionItem :label="t('nodeDetail.restartCount')">
              {{ runtimeState.restart_count }}
            </DescriptionItem>
            <DescriptionItem :label="t('nodeDetail.shutdownState')">
              {{ protocolLabels.stateSummary(runtimeState.shutdown_state) }}
            </DescriptionItem>
          </DescriptionList>
          <Box
            v-if="runtimeState.last_failure || runtimeState.last_policy_decision"
            class="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950"
          >
            <Text v-if="runtimeState.last_failure" class="whitespace-pre-wrap break-words text-sm leading-5 text-amber-950 dark:text-amber-100">
              {{ t("nodeDetail.lastFailure", { value: runtimeState.last_failure }) }}
            </Text>
            <Text v-if="runtimeState.last_policy_decision" class="whitespace-pre-wrap break-words text-sm leading-5 text-amber-950 dark:text-amber-100">
              {{ t("nodeDetail.lastPolicyDecision", { value: runtimeState.last_policy_decision }) }}
            </Text>
          </Box>
        </ListItem>
      </List>
    </Box>
  </Section>
</template>
