<script setup lang="ts">
import { computed } from "vue";
import { Eraser, ListFilter, ScrollText } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { Box, InlineGroup, List, ListItem, PanelHeader, Section, Text } from "@/components/layout";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProtocolLabels } from "@/i18n/protocolLabels";
import { eventStore, type TimelineRecord } from "@/state/eventStore";
import type { LogEventFilterConditionsMessage } from "@/types/protocol";

const emit = defineEmits<{
  filterUpdate: [message: LogEventFilterConditionsMessage];
}>();

const { t } = useI18n();
const protocolLabels = useProtocolLabels();
const records = computed(() => eventStore.filteredRecords.value);
const droppedEvents = computed(() => eventStore.droppedEventTotal.value);
const droppedLogs = computed(() => eventStore.droppedLogTotal.value);

function title(record: TimelineRecord): string {
  if (record.kind === "event") {
    return protocolLabels.eventType(record.event.event_type);
  }
  if (record.kind === "log") {
    return t("eventLog.logTitle");
  }
  return t("eventLog.auditTitle", { command: protocolLabels.command(record.audit.command) });
}

function detail(record: TimelineRecord): string {
  if (record.kind === "event") {
    return t("eventLog.eventDetail", {
      correlationId: record.event.correlation_id,
      path: record.event.target_path
    });
  }
  if (record.kind === "log") {
    return record.log.message;
  }
  return t("eventLog.auditDetail", {
    path: record.audit.target.child_path ?? "/root",
    reason: record.audit.reason
  });
}

function badgeVariant(severity: string): "danger" | "warning" | "success" | "muted" {
  if (severity === "error") {
    return "danger";
  }
  if (severity === "warning") {
    return "warning";
  }
  if (severity === "info") {
    return "success";
  }
  return "muted";
}

function clearFilters(): void {
  emit("filterUpdate", eventStore.clearFilters());
}
</script>

<template>
  <Section aria-label="event log">
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.eventLog')"
      :title="t('sections.eventTitle')"
    >
      <InlineGroup wrap gap="sm">
        <Badge variant="warning">{{ t("eventLog.droppedEvents", { count: droppedEvents }) }}</Badge>
        <Badge variant="muted">{{ t("eventLog.droppedLogs", { count: droppedLogs }) }}</Badge>
      </InlineGroup>
    </PanelHeader>

    <Box v-if="eventStore.state.sequenceDiagnostics.length > 0" class="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      <Text v-for="diagnostic in eventStore.state.sequenceDiagnostics" :key="diagnostic">
        {{ diagnostic }}
      </Text>
    </Box>

    <ScrollArea class="max-h-[28rem] rounded-md border" data-testid="event-log">
      <Empty v-if="records.length === 0" class="min-h-48 rounded-md border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListFilter aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{{ t("eventLog.emptyTitle") }}</EmptyTitle>
          <EmptyDescription>{{ t("eventLog.emptyDescription") }}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" variant="outline" size="sm" @click="clearFilters">
            <Eraser aria-hidden="true" />
            {{ t("eventLog.clearFilters") }}
          </Button>
        </EmptyContent>
      </Empty>

      <List v-else class="divide-y">
        <ListItem
          v-for="record in records"
          :key="record.key"
          class="grid gap-2 p-3 text-sm sm:grid-cols-[7rem_1fr_auto]"
          data-testid="timeline-record"
        >
          <InlineGroup gap="sm" class="text-xs font-semibold text-muted-foreground">
            <ScrollText aria-hidden="true" />
            <Text as="span">#{{ record.sequence }}</Text>
          </InlineGroup>
          <Box class="min-w-0">
            <Text class="truncate font-semibold text-foreground">{{ title(record) }}</Text>
            <Text class="truncate text-xs text-muted-foreground">{{ record.target_id }}, {{ detail(record) }}</Text>
          </Box>
          <Badge :variant="badgeVariant(record.severity)" class="justify-self-start sm:justify-self-end">
            {{ protocolLabels.severity(record.severity) }}
          </Badge>
        </ListItem>
      </List>
    </ScrollArea>
  </Section>
</template>
