import { computed, reactive } from "vue";
import type {
  AuditEvent,
  DashboardState,
  EventRecord,
  LogEventFilterConditionsMessage,
  LifecycleState,
  LogRecord,
  Severity
} from "@/types/protocol";

export type TimelineRecord =
  | { kind: "event"; key: string; target_id: string; sequence: number; severity: Severity; event: EventRecord }
  | { kind: "log"; key: string; target_id: string; sequence: number; severity: Severity; log: LogRecord }
  | { kind: "audit"; key: string; target_id: string; sequence: number; severity: Severity; audit: AuditEvent };

export interface EventFilters {
  target_ids: string[];
  child_paths: string[];
  lifecycle_states: LifecycleState[];
  event_types: string[];
  severities: Severity[];
  sequence_min?: number;
  correlation_id?: string;
}

interface EventStoreState {
  events: EventRecord[];
  logs: LogRecord[];
  audits: AuditEvent[];
  droppedEventsByTarget: Record<string, number>;
  droppedLogsByTarget: Record<string, number>;
  lastSequenceByTarget: Record<string, number>;
  sequenceDiagnostics: string[];
  filters: EventFilters;
}

const emptyFilters = (): EventFilters => ({
  target_ids: [],
  child_paths: [],
  lifecycle_states: [],
  event_types: [],
  severities: [],
  sequence_min: undefined,
  correlation_id: undefined
});

const state = reactive<EventStoreState>({
  events: [],
  logs: [],
  audits: [],
  droppedEventsByTarget: {},
  droppedLogsByTarget: {},
  lastSequenceByTarget: {},
  sequenceDiagnostics: [],
  filters: emptyFilters()
});

const allRecords = computed<TimelineRecord[]>(() => {
  const eventRecords = state.events.map<TimelineRecord>((event) => ({
    kind: "event",
    key: `event:${event.target_id}:${event.sequence}`,
    target_id: event.target_id,
    sequence: event.sequence,
    severity: event.severity,
    event
  }));
  const logRecords = state.logs.map<TimelineRecord>((log, index) => ({
    kind: "log",
    key: `log:${log.target_id}:${log.sequence ?? index}:${log.correlation_id ?? "none"}`,
    target_id: log.target_id,
    sequence: log.sequence ?? 0,
    severity: log.severity,
    log
  }));
  const auditRecords = state.audits.map<TimelineRecord>((audit, index) => ({
    kind: "audit",
    key: `audit:${audit.audit_id}:${index}`,
    target_id: audit.target_id,
    sequence: Number.MAX_SAFE_INTEGER - index,
    severity: audit.result === "failed" || audit.result === "rejected" ? "error" : "info",
    audit
  }));

  return [...eventRecords, ...logRecords, ...auditRecords].sort((left, right) => {
    if (left.target_id !== right.target_id) {
      return left.target_id.localeCompare(right.target_id);
    }
    return left.sequence - right.sequence;
  });
});

const filteredRecords = computed(() => allRecords.value.filter(matchesFilters));

const droppedEventTotal = computed(() =>
  Object.values(state.droppedEventsByTarget).reduce((sum, count) => sum + count, 0)
);

const droppedLogTotal = computed(() =>
  Object.values(state.droppedLogsByTarget).reduce((sum, count) => sum + count, 0)
);

function resetEventStore(): void {
  state.events = [];
  state.logs = [];
  state.audits = [];
  state.droppedEventsByTarget = {};
  state.droppedLogsByTarget = {};
  state.lastSequenceByTarget = {};
  state.sequenceDiagnostics = [];
  state.filters = emptyFilters();
}

function applyDashboardState(dashboardState: DashboardState): void {
  state.droppedEventsByTarget[dashboardState.target.target_id] = dashboardState.dropped_event_count;
  state.droppedLogsByTarget[dashboardState.target.target_id] = dashboardState.dropped_log_count;
  for (const event of dashboardState.recent_events) {
    appendEvent(event);
  }
  for (const log of dashboardState.recent_logs) {
    appendLog(log);
  }
}

function appendEvent(event: EventRecord): void {
  const exists = state.events.some(
    (item) => item.target_id === event.target_id && item.sequence === event.sequence
  );
  if (exists) {
    return;
  }

  const lastSequence = state.lastSequenceByTarget[event.target_id];
  if (typeof lastSequence === "number" && event.sequence < lastSequence) {
    state.sequenceDiagnostics.unshift(
      `${event.target_id} sequence ${event.sequence} arrived after ${lastSequence}`
    );
  }
  state.lastSequenceByTarget[event.target_id] = Math.max(lastSequence ?? 0, event.sequence);
  state.events.push(event);
  state.events.sort((left, right) =>
    left.target_id === right.target_id
      ? left.sequence - right.sequence
      : left.target_id.localeCompare(right.target_id)
  );
}

function appendLog(log: LogRecord): void {
  const exists = state.logs.some(
    (item) =>
      item.target_id === log.target_id &&
      item.sequence === log.sequence &&
      item.correlation_id === log.correlation_id &&
      item.message === log.message
  );
  if (!exists) {
    state.logs.push(log);
  }
}

function appendAudit(audit: AuditEvent): void {
  const exists = state.audits.some((item) => item.audit_id === audit.audit_id);
  if (!exists) {
    state.audits.unshift(audit);
  }
}

function setDroppedCount(targetId: string, eventCount: number, logCount?: number): void {
  state.droppedEventsByTarget[targetId] = eventCount;
  if (typeof logCount === "number") {
    state.droppedLogsByTarget[targetId] = logCount;
  }
}

function setFilters(nextFilters: Partial<EventFilters>): LogEventFilterConditionsMessage {
  state.filters = {
    ...state.filters,
    ...nextFilters
  };
  return toFilterUpdate();
}

function clearFilters(): LogEventFilterConditionsMessage {
  state.filters = emptyFilters();
  return toFilterUpdate();
}

function toFilterUpdate(): LogEventFilterConditionsMessage {
  return {
    type: "log_event_filter_conditions",
    target_ids: [...state.filters.target_ids],
    child_paths: [...state.filters.child_paths],
    lifecycle_states: [...state.filters.lifecycle_states],
    event_types: [...state.filters.event_types],
    severities: [...state.filters.severities],
    sequence_min: state.filters.sequence_min,
    correlation_id: state.filters.correlation_id
  };
}

function matchesFilters(record: TimelineRecord): boolean {
  if (state.filters.target_ids.length > 0 && !state.filters.target_ids.includes(record.target_id)) {
    return false;
  }
  if (state.filters.severities.length > 0 && !state.filters.severities.includes(record.severity)) {
    return false;
  }
  if (
    typeof state.filters.sequence_min === "number" &&
    record.sequence < state.filters.sequence_min
  ) {
    return false;
  }
  if (state.filters.correlation_id && !recordCorrelationId(record)?.includes(state.filters.correlation_id)) {
    return false;
  }
  if (
    state.filters.child_paths.length > 0 &&
    !state.filters.child_paths.includes(recordChildPath(record) ?? "")
  ) {
    return false;
  }
  if (
    state.filters.event_types.length > 0 &&
    !state.filters.event_types.includes(recordEventType(record) ?? "")
  ) {
    return false;
  }
  if (
    state.filters.lifecycle_states.length > 0 &&
    !state.filters.lifecycle_states.includes(recordLifecycleState(record) ?? "running")
  ) {
    return false;
  }
  return true;
}

function recordCorrelationId(record: TimelineRecord): string | undefined {
  if (record.kind === "event") {
    return record.event.correlation_id;
  }
  if (record.kind === "log") {
    return record.log.correlation_id;
  }
  return record.audit.command_id;
}

function recordChildPath(record: TimelineRecord): string | undefined {
  if (record.kind === "event") {
    return record.event.target_path;
  }
  if (record.kind === "audit") {
    return record.audit.target.child_path;
  }
  return undefined;
}

function recordEventType(record: TimelineRecord): string | undefined {
  if (record.kind === "event") {
    return record.event.event_type;
  }
  if (record.kind === "audit") {
    return "command_audit";
  }
  return undefined;
}

function recordLifecycleState(record: TimelineRecord): LifecycleState | undefined {
  if (record.kind !== "event") {
    return undefined;
  }
  if (typeof record.event.payload.lifecycle_state === "string") {
    return record.event.payload.lifecycle_state as LifecycleState;
  }
  if (record.event.event_type.includes("failed")) {
    return "failed";
  }
  if (record.event.event_type.includes("restarted") || record.event.event_type.includes("reconnecting")) {
    return "restarting";
  }
  if (record.event.event_type.includes("unavailable")) {
    return "failed";
  }
  return "running";
}

export const eventStore = {
  state,
  allRecords,
  filteredRecords,
  droppedEventTotal,
  droppedLogTotal,
  applyDashboardState,
  appendEvent,
  appendLog,
  appendAudit,
  setDroppedCount,
  setFilters,
  clearFilters,
  toFilterUpdate,
  reset: resetEventStore
};
