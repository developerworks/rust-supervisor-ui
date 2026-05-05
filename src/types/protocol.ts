export type RegistrationState = "pending" | "active" | "rejected" | "expired";

export type ConnectionState =
  | "registered"
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "unavailable"
  | "expired";

export type LifecycleState =
  | "starting"
  | "running"
  | "paused"
  | "quarantined"
  | "failed"
  | "restarting"
  | "stopping"
  | "stopped"
  | "completed";

export type HealthState = "unknown" | "healthy" | "stale" | "unhealthy";

export type ReadinessState = "unknown" | "ready" | "not_ready";

export type Severity = "trace" | "debug" | "info" | "warning" | "error";

export type SupervisorNodeKind = "root_supervisor" | "child_task";

export type Criticality = "critical" | "standard" | "best_effort";

export type SupervisorEdgeKind = "parent_child" | "dependency";

export const controlCommandNames = [
  "restart_child",
  "pause_child",
  "resume_child",
  "quarantine_child",
  "remove_child",
  "add_child",
  "shutdown_tree"
] as const;

export type ControlCommandName = (typeof controlCommandNames)[number];

export const dangerousCommandNames = [
  "remove_child",
  "add_child",
  "shutdown_tree"
] as const satisfies readonly ControlCommandName[];

export interface RemoteIdentity {
  principal: string;
  source: "mtls" | "trusted_proxy";
}

export interface TargetSummary {
  target_id: string;
  display_name: string;
  registration_state: RegistrationState;
  connection_state: ConnectionState;
  authorization_scope: string;
}

export interface SessionEstablishedMessage {
  type: "session_established";
  session_id: string;
  identity: RemoteIdentity;
  targets: TargetSummary[];
}

export interface SupervisorNodeDiagnostics {
  message?: string;
  since?: string;
  policy?: string;
}

export interface SupervisorNode {
  node_id: string;
  child_id?: string;
  path: string;
  name: string;
  kind: SupervisorNodeKind;
  tags: string[];
  criticality: Criticality;
  state_summary: string;
  diagnostics?: SupervisorNodeDiagnostics;
}

export interface SupervisorEdge {
  edge_id: string;
  source_path: string;
  target_path: string;
  kind: SupervisorEdgeKind;
  order: number;
}

export interface SupervisorTopology {
  root: SupervisorNode;
  nodes: SupervisorNode[];
  edges: SupervisorEdge[];
  declaration_order: string[];
}

export interface RuntimeState {
  child_path: string;
  lifecycle_state: LifecycleState;
  health: HealthState;
  readiness: ReadinessState;
  generation: number;
  attempt: number;
  restart_count: number;
  last_failure?: string;
  last_policy_decision?: string;
  shutdown_state: string;
}

export interface TargetIdentity {
  target_id: string;
  display_name: string;
  authorization_scope: string;
}

export interface EventRecord {
  target_id: string;
  sequence: number;
  correlation_id: string;
  event_type: string;
  severity: Severity;
  target_path: string;
  child_id?: string;
  occurred_at: string;
  config_version: string;
  payload: Record<string, unknown>;
}

export interface LogRecord {
  target_id: string;
  sequence?: number;
  correlation_id?: string;
  severity: Severity;
  message: string;
  fields: Record<string, unknown>;
  occurred_at: string;
}

export interface DashboardSnapshot {
  target: TargetIdentity;
  topology: SupervisorTopology;
  runtime_state: RuntimeState[];
  recent_events: EventRecord[];
  recent_logs: LogRecord[];
  dropped_event_count: number;
  dropped_log_count: number;
  config_version: string;
  generated_at: string;
  snapshot_generation: number;
}

export interface DashboardStateDelta {
  snapshot_generation?: number;
  runtime_state?: RuntimeState[];
  connection_state?: ConnectionState;
}

export interface DashboardError {
  code: string;
  stage: string;
  message: string;
  target_id?: string;
  retryable: boolean;
}

export interface ControlCommandTarget {
  child_path?: string;
  child_id?: string;
}

export interface ControlCommandRequest {
  type: "command";
  command_id: string;
  target_id: string;
  command: ControlCommandName;
  target: ControlCommandTarget;
  reason: string;
  confirmed: boolean;
}

export interface ControlCommandResult {
  command_id: string;
  target_id: string;
  accepted: boolean;
  status: "accepted" | "rejected" | "completed" | "failed";
  error?: DashboardError;
  state_delta?: DashboardStateDelta;
  completed_at: string;
}

export interface AuditEvent {
  audit_id: string;
  identity: RemoteIdentity;
  target_id: string;
  command_id: string;
  command: ControlCommandName;
  target: ControlCommandTarget;
  reason: string;
  result: string;
  occurred_at: string;
}

export interface FilterUpdate {
  type: "filter_update";
  target_ids: string[];
  child_paths: string[];
  lifecycle_states: LifecycleState[];
  event_types: string[];
  severities: Severity[];
  sequence_from?: number;
  correlation_id?: string;
}

export type ServerMessage =
  | SessionEstablishedMessage
  | { type: "snapshot"; target_id: string; snapshot: DashboardSnapshot }
  | { type: "event"; target_id: string; event: EventRecord }
  | { type: "log"; target_id: string; log: LogRecord }
  | { type: "state_delta"; target_id: string; delta: DashboardStateDelta }
  | { type: "command_result"; target_id: string; result: ControlCommandResult }
  | { type: "audit_event"; target_id: string; audit: AuditEvent }
  | { type: "error"; error: DashboardError };

export type ClientMessage = ControlCommandRequest | FilterUpdate;

export function isControlCommandName(value: string): value is ControlCommandName {
  return controlCommandNames.includes(value as ControlCommandName);
}

export function isDangerousCommandName(value: ControlCommandName): boolean {
  return dangerousCommandNames.includes(value as (typeof dangerousCommandNames)[number]);
}

export function createCommandId(): string {
  return `cmd-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 10)}`;
}
