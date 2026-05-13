<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ChevronLeft, ChevronRight, Eraser, ListFilter } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { Box, InlineGroup, PanelHeader, Section, Text } from "@/components/layout";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useProtocolLabels } from "@/i18n/protocolLabels";
import { eventStore, type TimelineRecord } from "@/state/eventStore";
import type { LogEventFilterConditionsMessage } from "@/types/protocol";

const emit = defineEmits<{
  filterUpdate: [message: LogEventFilterConditionsMessage];
}>();

const { t } = useI18n();
const protocolLabels = useProtocolLabels();
const records = computed(() => eventStore.filteredRecords.value);
const currentPage = ref(1);
const pageSize = 10;
const droppedEvents = computed(() => eventStore.droppedEventTotal.value);
const droppedLogs = computed(() => eventStore.droppedLogTotal.value);
const totalPages = computed(() => Math.max(1, Math.ceil(records.value.length / pageSize)));
const pageStartIndex = computed(() => (currentPage.value - 1) * pageSize);
const pagedRecords = computed(() => records.value.slice(pageStartIndex.value, pageStartIndex.value + pageSize));
const pageRangeStart = computed(() => (records.value.length === 0 ? 0 : pageStartIndex.value + 1));
const pageRangeEnd = computed(() => Math.min(records.value.length, pageStartIndex.value + pagedRecords.value.length));
const pageSummary = computed(() =>
  t("eventLog.paginationSummary", {
    start: pageRangeStart.value,
    end: pageRangeEnd.value,
    total: records.value.length,
    page: currentPage.value,
    pages: totalPages.value
  })
);

watch(records, () => {
  currentPage.value = Math.min(currentPage.value, totalPages.value);
  if (currentPage.value < 1) {
    currentPage.value = 1;
  }
});

function title(record: TimelineRecord): string {
  if (record.kind === "event") {
    return protocolLabels.eventType(record.event.event_type);
  }
  if (record.kind === "log") {
    return t("eventLog.logTitle");
  }
  return t("eventLog.auditTitle", { command: protocolLabels.command(record.audit.command) });
}

function kindLabel(record: TimelineRecord): string {
  return t(`eventLog.kind.${record.kind}`);
}

function detail(record: TimelineRecord): string {
  const transition = lifecycleTransitionDetail(record);
  if (record.kind === "event") {
    const eventDetail = t("eventLog.eventDetail", {
      correlationId: record.event.correlation_id,
      path: record.event.target_path
    });
    return transition ? `${eventDetail}\n${transition}` : eventDetail;
  }
  if (record.kind === "log") {
    return transition ? `${record.log.message}\n${transition}` : record.log.message;
  }
  return t("eventLog.auditDetail", {
    path: record.audit.target.child_path ?? "/root",
    reason: record.audit.reason
  });
}

function lifecycleTransitionDetail(record: TimelineRecord): string | null {
  const transition =
    record.kind === "event"
      ? lifecycleTransition(record.event.payload)
      : record.kind === "log"
        ? lifecycleTransition(record.log.fields)
        : null;

  if (!transition) {
    return null;
  }

  return t("eventLog.lifecycleTransition", {
    from: protocolLabels.lifecycle(transition.previous),
    to: protocolLabels.lifecycle(transition.current)
  });
}

function lifecycleTransition(fields: Record<string, unknown>): { previous: string; current: string } | null {
  const previous = stringField(fields, "previous_lifecycle_state");
  const current = stringField(fields, "lifecycle_state");
  if (!previous || !current) {
    return null;
  }
  return { previous, current };
}

function stringField(fields: Record<string, unknown>, key: string): string | null {
  const value = fields[key];
  return typeof value === "string" && value.length > 0 ? value : null;
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

function previousPage(): void {
  currentPage.value = Math.max(1, currentPage.value - 1);
}

function nextPage(): void {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1);
}
</script>

<template>
  <Section class="min-w-0" aria-label="event log">
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

    <Box class="rounded-md border" data-testid="event-log">
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

      <template v-else>
        <Box class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-24">{{ t("eventLog.columns.sequence") }}</TableHead>
                <TableHead class="w-28">{{ t("eventLog.columns.kind") }}</TableHead>
                <TableHead class="w-32">{{ t("eventLog.columns.severity") }}</TableHead>
                <TableHead class="min-w-48">{{ t("eventLog.columns.target") }}</TableHead>
                <TableHead class="min-w-56">{{ t("eventLog.columns.summary") }}</TableHead>
                <TableHead class="min-w-80">{{ t("eventLog.columns.detail") }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="record in pagedRecords" :key="record.key" data-testid="timeline-record">
                <TableCell class="font-mono text-xs text-muted-foreground">#{{ record.sequence }}</TableCell>
                <TableCell>{{ kindLabel(record) }}</TableCell>
                <TableCell>
                  <Badge :variant="badgeVariant(record.severity)">
                    {{ protocolLabels.severity(record.severity) }}
                  </Badge>
                </TableCell>
                <TableCell class="break-all text-xs text-muted-foreground">{{ record.target_id }}</TableCell>
                <TableCell class="break-words font-semibold text-foreground">{{ title(record) }}</TableCell>
                <TableCell class="whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">
                  {{ detail(record) }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <InlineGroup
          justify="between"
          class="border-t p-3 text-xs text-muted-foreground"
          data-testid="event-log-pagination"
        >
          <Text as="span">{{ pageSummary }}</Text>
          <InlineGroup gap="sm">
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="currentPage === 1"
              data-testid="event-log-page-previous"
              @click="previousPage"
            >
              <ChevronLeft aria-hidden="true" />
              {{ t("eventLog.previousPage") }}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="currentPage === totalPages"
              data-testid="event-log-page-next"
              @click="nextPage"
            >
              {{ t("eventLog.nextPage") }}
              <ChevronRight aria-hidden="true" />
            </Button>
          </InlineGroup>
        </InlineGroup>
      </template>
    </Box>
  </Section>
</template>
