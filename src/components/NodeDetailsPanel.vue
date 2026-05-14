<script setup lang="ts">
import { computed } from "vue";
import { FileText, ShieldAlert } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import {
  Box,
  DescriptionItem,
  DescriptionList,
  Heading,
  InlineGroup,
  List,
  ListItem,
  PanelHeader,
  Section,
  Stack,
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
import { displayTaskPath } from "@/lib/taskPath";
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
  <Section aria-label="node detail">
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.nodeDetail')"
      :title="t('sections.nodeTitle')"
    >
      <FileText class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </PanelHeader>

    <Empty v-if="!detail" class="min-h-48 rounded-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{{ t("nodeDetail.emptyTitle") }}</EmptyTitle>
        <EmptyDescription>{{ t("nodeDetail.emptyDescription") }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <Stack v-else gap="lg" data-testid="node-detail">
      <Box>
        <InlineGroup align="start" justify="between" class="gap-3">
          <Box class="min-w-0">
            <Heading level="3" class="truncate text-base font-semibold leading-6 text-foreground">{{ detail.node.name }}</Heading>
            <Text class="truncate text-xs text-muted-foreground">{{ displayTaskPath(detail.node.path) }}</Text>
          </Box>
          <Badge :variant="stateVariant(detail.runtimeState?.lifecycle_state)">
            {{ detail.runtimeState ? protocolLabels.lifecycle(detail.runtimeState.lifecycle_state) : protocolLabels.stateSummary(detail.node.state_summary) }}
          </Badge>
        </InlineGroup>
        <InlineGroup wrap gap="sm" class="mt-3">
          <Badge v-for="tag in detail.node.tags" :key="tag" variant="outline">{{ tag }}</Badge>
          <Badge variant="secondary">{{ protocolLabels.criticality(detail.node.criticality) }}</Badge>
        </InlineGroup>
      </Box>

      <DescriptionList v-if="detail.runtimeState" class="grid grid-cols-2 gap-3 text-sm">
        <DescriptionItem :label="t('nodeDetail.health')">
          {{ protocolLabels.health(detail.runtimeState.health) }}
        </DescriptionItem>
        <DescriptionItem :label="t('nodeDetail.readiness')">
          {{ protocolLabels.readiness(detail.runtimeState.readiness) }}
        </DescriptionItem>
        <DescriptionItem :label="t('nodeDetail.restartCount')">
          {{ detail.runtimeState.restart_count }}
        </DescriptionItem>
        <DescriptionItem :label="t('nodeDetail.shutdownState')">
          {{ protocolLabels.stateSummary(detail.runtimeState.shutdown_state) }}
        </DescriptionItem>
      </DescriptionList>

      <Box v-if="detail.runtimeState?.last_failure || detail.runtimeState?.last_policy_decision" class="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
        <InlineGroup gap="sm" class="mb-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
          <ShieldAlert class="h-4 w-4" aria-hidden="true" />
          {{ t("nodeDetail.recentDiagnostics") }}
        </InlineGroup>
        <Text v-if="detail.runtimeState.last_failure" class="text-sm leading-5 text-amber-950 dark:text-amber-100">
          {{ t("nodeDetail.lastFailure", { value: detail.runtimeState.last_failure }) }}
        </Text>
        <Text v-if="detail.runtimeState.last_policy_decision" class="text-sm leading-5 text-amber-950 dark:text-amber-100">
          {{ t("nodeDetail.lastPolicyDecision", { value: detail.runtimeState.last_policy_decision }) }}
        </Text>
      </Box>

      <Box>
        <Text class="mb-2 text-sm font-semibold">{{ t("nodeDetail.recentEvents") }}</Text>
        <Box v-if="relatedEvents.length === 0" class="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          {{ t("nodeDetail.noRecentEvents") }}
        </Box>
        <List v-else class="flex flex-col gap-2">
          <ListItem v-for="event in relatedEvents" :key="event.sequence" class="rounded-md border bg-card p-3 text-xs">
            <InlineGroup justify="between" class="gap-2">
              <Text as="span" class="font-semibold">{{ protocolLabels.eventType(event.event_type) }}</Text>
              <Badge :variant="event.severity === 'error' ? 'danger' : event.severity === 'warning' ? 'warning' : 'muted'">
                {{ protocolLabels.severity(event.severity) }}
              </Badge>
            </InlineGroup>
            <Text class="mt-1 text-muted-foreground">{{ t("nodeDetail.sequenceAndCorrelation", { sequence: event.sequence, correlationId: event.correlation_id }) }}</Text>
          </ListItem>
        </List>
      </Box>
    </Stack>
  </Section>
</template>
