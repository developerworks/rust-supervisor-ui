<script setup lang="ts">
import { computed } from "vue";
import { ListFilter, ScrollText } from "lucide-vue-next";
import Badge from "@/components/ui/Badge.vue";
import Card from "@/components/ui/Card.vue";
import { eventStore, type TimelineRecord } from "@/state/eventStore";

const records = computed(() => eventStore.filteredRecords.value);
const droppedEvents = computed(() => eventStore.droppedEventTotal.value);
const droppedLogs = computed(() => eventStore.droppedLogTotal.value);

function title(record: TimelineRecord): string {
  if (record.kind === "event") {
    return record.event.event_type;
  }
  if (record.kind === "log") {
    return "log record(日志记录)";
  }
  return `command audit(命令审计): ${record.audit.command}`;
}

function detail(record: TimelineRecord): string {
  if (record.kind === "event") {
    return `${record.event.target_path}, correlation id(关联标识): ${record.event.correlation_id}`;
  }
  if (record.kind === "log") {
    return record.log.message;
  }
  return `${record.audit.target.child_path ?? "/root"}, reason(原因): ${record.audit.reason}`;
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
        <p class="muted-label">event log(事件日志)</p>
        <h2 class="panel-title">事件和日志流</h2>
      </div>
      <div class="flex flex-wrap gap-2">
        <Badge variant="warning">Dropped events {{ droppedEvents }}</Badge>
        <Badge variant="muted">Dropped logs {{ droppedLogs }}</Badge>
      </div>
    </div>

    <div v-if="eventStore.state.sequenceDiagnostics.length > 0" class="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <p v-for="diagnostic in eventStore.state.sequenceDiagnostics" :key="diagnostic">
        {{ diagnostic }}
      </p>
    </div>

    <div class="max-h-[28rem] overflow-auto rounded-md border" data-testid="event-log">
      <div v-if="records.length === 0" class="flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground">
        <ListFilter class="h-4 w-4" aria-hidden="true" />
        当前过滤条件没有匹配记录.
      </div>

      <ul v-else class="divide-y">
        <li
          v-for="record in records"
          :key="record.key"
          class="grid gap-2 p-3 text-sm sm:grid-cols-[7rem_1fr_auto]"
          data-testid="timeline-record"
        >
          <div class="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <ScrollText class="h-4 w-4" aria-hidden="true" />
            <span>#{{ record.sequence }}</span>
          </div>
          <div class="min-w-0">
            <p class="truncate font-semibold text-slate-950">{{ title(record) }}</p>
            <p class="truncate text-xs text-muted-foreground">{{ record.target_id }}, {{ detail(record) }}</p>
          </div>
          <Badge :variant="badgeVariant(record.severity)" class="justify-self-start sm:justify-self-end">
            {{ record.severity }}
          </Badge>
        </li>
      </ul>
    </div>
  </Card>
</template>
