<script setup lang="ts">
import { computed } from "vue";
import { ListFilter, ScrollText } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import Badge from "@/components/ui/Badge.vue";
import Card from "@/components/ui/Card.vue";
import { useProtocolLabels } from "@/i18n/protocolLabels";
import { eventStore, type TimelineRecord } from "@/state/eventStore";

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
</script>

<template>
  <Card aria-label="event log">
    <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="muted-label">{{ t("sections.eventLog") }}</p>
        <h2 class="panel-title">{{ t("sections.eventTitle") }}</h2>
      </div>
      <div class="flex flex-wrap gap-2">
        <Badge variant="warning">{{ t("eventLog.droppedEvents", { count: droppedEvents }) }}</Badge>
        <Badge variant="muted">{{ t("eventLog.droppedLogs", { count: droppedLogs }) }}</Badge>
      </div>
    </div>

    <div v-if="eventStore.state.sequenceDiagnostics.length > 0" class="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      <p v-for="diagnostic in eventStore.state.sequenceDiagnostics" :key="diagnostic">
        {{ diagnostic }}
      </p>
    </div>

    <div class="max-h-[28rem] overflow-auto rounded-md border" data-testid="event-log">
      <div v-if="records.length === 0" class="flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground">
        <ListFilter class="h-4 w-4" aria-hidden="true" />
        {{ t("eventLog.empty") }}
      </div>

      <ul v-else class="divide-y">
        <li
          v-for="record in records"
          :key="record.key"
          class="grid gap-2 p-3 text-sm sm:grid-cols-[7rem_1fr_auto]"
          data-testid="timeline-record"
        >
          <div class="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <ScrollText class="h-4 w-4" aria-hidden="true" />
            <span>#{{ record.sequence }}</span>
          </div>
          <div class="min-w-0">
            <p class="truncate font-semibold text-foreground">{{ title(record) }}</p>
            <p class="truncate text-xs text-muted-foreground">{{ record.target_id }}, {{ detail(record) }}</p>
          </div>
          <Badge :variant="badgeVariant(record.severity)" class="justify-self-start sm:justify-self-end">
            {{ protocolLabels.severity(record.severity) }}
          </Badge>
        </li>
      </ul>
    </div>
  </Card>
</template>
