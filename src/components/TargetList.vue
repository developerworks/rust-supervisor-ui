<script setup lang="ts">
import { computed } from "vue";
import { Activity, AlertTriangle, Ban, Cable, RefreshCcw, Server } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { Box, InlineGroup, InteractiveRow, PanelHeader, Section, Stack, Text } from "@/components/layout";
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
  <Section aria-label="target list">
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.targetList')"
      :title="t('sections.targetTitle')"
    >
      <Server class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </PanelHeader>

    <Empty v-if="targets.length === 0" class="min-h-48 rounded-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Server aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{{ t("targetList.emptyTitle") }}</EmptyTitle>
        <EmptyDescription>{{ t("targetList.emptyDescription") }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <Stack gap="sm" data-testid="target-list">
      <InteractiveRow
        v-for="target in targets"
        :key="target.target_id"
        class="w-full rounded-md border p-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="target.target_id === selectedTargetId ? 'border-primary bg-secondary' : 'border-border bg-card'"
        @click="stateStore.selectTarget(target.target_id)"
      >
        <InlineGroup align="start" justify="between" class="gap-3">
          <Box class="min-w-0">
            <Text class="truncate text-sm font-semibold text-foreground">{{ target.display_name }}</Text>
            <Text class="mt-0.5 truncate text-xs text-muted-foreground">{{ target.target_id }}</Text>
          </Box>
          <Badge :variant="statusVariant(target.connection_state)">
            <component :is="statusIcon(target.connection_state)" class="mr-1 h-3 w-3" aria-hidden="true" />
            {{ statusLabel(target.connection_state) }}
          </Badge>
        </InlineGroup>
        <InlineGroup class="mt-3 gap-2 text-xs text-muted-foreground">
          <AlertTriangle
            v-if="target.connection_state === 'unavailable'"
            class="h-3.5 w-3.5 text-red-600"
            aria-hidden="true"
          />
          <Text as="span" class="truncate">{{ t("targetList.commands", { commands: commandList(target.supported_commands) }) }}</Text>
        </InlineGroup>
      </InteractiveRow>
    </Stack>
  </Section>
</template>
