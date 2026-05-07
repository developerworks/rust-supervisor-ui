import type {
  AuditEvent,
  ControlCommandName,
  ControlCommandRequest,
  ControlCommandResult,
  DashboardState,
  EventRecord,
  LogRecord,
  RuntimeState,
  ServerMessage,
  SupervisorEdge,
  SupervisorNode,
  TargetSummary
} from "@/types/protocol";

export const mockTargets: TargetSummary[] = [
  {
    target_id: "payments-worker-a",
    display_name: "payments worker a",
    registration_state: "active",
    connection_state: "connected",
    authorization_scope: "payments:operate"
  },
  {
    target_id: "billing-worker-b",
    display_name: "billing worker b",
    registration_state: "active",
    connection_state: "unavailable",
    authorization_scope: "billing:observe"
  },
  {
    target_id: "search-worker-c",
    display_name: "search worker c",
    registration_state: "active",
    connection_state: "reconnecting",
    authorization_scope: "search:operate"
  }
];

const baseTime = "2026-05-06T00:50:00.000Z";

function event(
  target_id: string,
  sequence: number,
  event_type: string,
  severity: EventRecord["severity"],
  target_path: string,
  correlation_id: string,
  payload: Record<string, unknown>
): EventRecord {
  return {
    target_id,
    sequence,
    event_type,
    severity,
    target_path,
    child_id: target_path.split("/").filter(Boolean).at(-1),
    correlation_id,
    occurred_at: baseTime,
    config_version: "cfg-2026-05-06",
    payload
  };
}

function log(
  target_id: string,
  sequence: number,
  severity: LogRecord["severity"],
  message: string,
  correlation_id: string
): LogRecord {
  return {
    target_id,
    sequence,
    correlation_id,
    severity,
    message,
    fields: { module: "supervisor.dashboard" },
    occurred_at: baseTime
  };
}

function node(
  path: string,
  name: string,
  state_summary: string,
  tags: string[],
  kind: SupervisorNode["kind"] = "child_task",
  criticality: SupervisorNode["criticality"] = "standard"
): SupervisorNode {
  return {
    node_id: path === "/root" ? "root" : path.slice(1).replaceAll("/", "-"),
    child_id: kind === "child_task" ? path.split("/").filter(Boolean).at(-1) : undefined,
    path,
    name,
    kind,
    tags,
    criticality,
    state_summary,
    diagnostics:
      state_summary === "failed"
        ? {
            message: "downstream duplicate processing detected",
            since: "2026-05-06T00:41:10.000Z",
            policy: "quarantine after three failed restart attempts"
          }
        : undefined
  };
}

function runtime(
  child_path: string,
  lifecycle_state: RuntimeState["lifecycle_state"],
  health: RuntimeState["health"],
  readiness: RuntimeState["readiness"],
  restart_count: number,
  last_failure?: string,
  last_policy_decision?: string
): RuntimeState {
  return {
    child_path,
    lifecycle_state,
    health,
    readiness,
    generation: restart_count + 1,
    attempt: lifecycle_state === "restarting" ? 2 : 1,
    restart_count,
    last_failure,
    last_policy_decision,
    shutdown_state: lifecycle_state === "stopping" ? "draining" : "none"
  };
}

function edge(
  source_path: string,
  target_path: string,
  kind: SupervisorEdge["kind"],
  order: number
): SupervisorEdge {
  return {
    edge_id: `${source_path}->${target_path}:${kind}`,
    source_path,
    target_path,
    kind,
    order
  };
}

export const paymentsState: DashboardState = {
  target: {
    target_id: "payments-worker-a",
    display_name: "payments worker a",
    authorization_scope: "payments:operate"
  },
  topology: {
    root: node("/root", "payments root supervisor", "running", ["root"], "root_supervisor", "critical"),
    nodes: [
      node("/root", "payments root supervisor", "running", ["root"], "root_supervisor", "critical"),
      node("/root/payment_loop", "payment loop", "running", ["payments", "stream"], "child_task", "critical"),
      node("/root/duplicate_guard", "duplicate guard", "failed", ["payments", "guard"], "child_task", "critical"),
      node("/root/retry_scheduler", "retry scheduler", "restarting", ["retry"], "child_task", "standard"),
      node("/root/audit_sink", "audit sink", "paused", ["audit"], "child_task", "best_effort")
    ],
    edges: [
      edge("/root", "/root/payment_loop", "parent_child", 1),
      edge("/root", "/root/duplicate_guard", "parent_child", 2),
      edge("/root", "/root/retry_scheduler", "parent_child", 3),
      edge("/root", "/root/audit_sink", "parent_child", 4),
      edge("/root/payment_loop", "/root/duplicate_guard", "dependency", 1),
      edge("/root/duplicate_guard", "/root/retry_scheduler", "dependency", 2)
    ],
    declaration_order: [
      "/root",
      "/root/payment_loop",
      "/root/duplicate_guard",
      "/root/retry_scheduler",
      "/root/audit_sink"
    ]
  },
  runtime_state: [
    runtime("/root", "running", "healthy", "ready", 0),
    runtime("/root/payment_loop", "running", "healthy", "ready", 1),
    runtime(
      "/root/duplicate_guard",
      "failed",
      "unhealthy",
      "not_ready",
      3,
      "duplicate event window exceeded",
      "quarantine after three failed restart attempts"
    ),
    runtime(
      "/root/retry_scheduler",
      "restarting",
      "stale",
      "not_ready",
      2,
      "timer wheel lag exceeded threshold",
      "restart with exponential backoff"
    ),
    runtime("/root/audit_sink", "paused", "stale", "not_ready", 0, undefined, "manual pause for sink migration")
  ],
  recent_events: [
    event(
      "payments-worker-a",
      1001,
      "child_started",
      "info",
      "/root/payment_loop",
      "startup-1",
      { generation: 2 }
    ),
    event(
      "payments-worker-a",
      1002,
      "child_failed",
      "error",
      "/root/duplicate_guard",
      "restart-7",
      { failure: "duplicate event window exceeded" }
    ),
    event(
      "payments-worker-a",
      1003,
      "child_restarted",
      "warning",
      "/root/retry_scheduler",
      "restart-7",
      { attempt: 2 }
    )
  ],
  recent_logs: [
    log("payments-worker-a", 1002, "error", "duplicate guard rejected the current event window", "restart-7"),
    log("payments-worker-a", 1003, "warning", "retry scheduler is rebuilding its timer wheel", "restart-7")
  ],
  dropped_event_count: 2,
  dropped_log_count: 1,
  config_version: "cfg-2026-05-06",
  generated_at: baseTime,
  state_generation: 42
};

export const billingState: DashboardState = {
  target: {
    target_id: "billing-worker-b",
    display_name: "billing worker b",
    authorization_scope: "billing:observe"
  },
  topology: {
    root: node("/root", "billing root supervisor", "unavailable", ["root"], "root_supervisor", "critical"),
    nodes: [
      node("/root", "billing root supervisor", "unavailable", ["root"], "root_supervisor", "critical"),
      node("/root/invoice_writer", "invoice writer", "quarantined", ["billing"], "child_task", "critical")
    ],
    edges: [edge("/root", "/root/invoice_writer", "parent_child", 1)],
    declaration_order: ["/root", "/root/invoice_writer"]
  },
  runtime_state: [
    runtime("/root", "stopped", "unknown", "unknown", 0, "IPC path unavailable", "mark target unavailable"),
    runtime("/root/invoice_writer", "quarantined", "unhealthy", "not_ready", 4, "lease heartbeat missed")
  ],
  recent_events: [
    event("billing-worker-b", 404, "target_unavailable", "error", "/root/invoice_writer", "billing-lease", {
      ipc_path: "/run/rust-supervisor/billing-worker-b.sock"
    })
  ],
  recent_logs: [
    log("billing-worker-b", 404, "error", "IPC path is unavailable after reconnect budget", "billing-lease")
  ],
  dropped_event_count: 0,
  dropped_log_count: 0,
  config_version: "cfg-2026-05-06",
  generated_at: baseTime,
  state_generation: 8
};

export const searchState: DashboardState = {
  target: {
    target_id: "search-worker-c",
    display_name: "search worker c",
    authorization_scope: "search:operate"
  },
  topology: {
    root: node("/root", "search root supervisor", "reconnecting", ["root"], "root_supervisor", "critical"),
    nodes: [
      node("/root", "search root supervisor", "reconnecting", ["root"], "root_supervisor", "critical"),
      node("/root/index_stream", "index stream", "restarting", ["search", "index"], "child_task", "standard"),
      node("/root/cache_refresh", "cache refresh", "running", ["cache"], "child_task", "best_effort")
    ],
    edges: [
      edge("/root", "/root/index_stream", "parent_child", 1),
      edge("/root", "/root/cache_refresh", "parent_child", 2),
      edge("/root/index_stream", "/root/cache_refresh", "dependency", 3)
    ],
    declaration_order: ["/root", "/root/index_stream", "/root/cache_refresh"]
  },
  runtime_state: [
    runtime("/root", "restarting", "stale", "not_ready", 1, "IPC reconnect in progress"),
    runtime("/root/index_stream", "restarting", "stale", "not_ready", 2, "index stream lost checkpoint"),
    runtime("/root/cache_refresh", "running", "healthy", "ready", 0)
  ],
  recent_events: [
    event("search-worker-c", 701, "target_reconnecting", "warning", "/root/index_stream", "search-reconnect", {
      reconnect_budget_seconds: 10
    })
  ],
  recent_logs: [
    log("search-worker-c", 701, "warning", "relay is waiting for a fresh state before events resume", "search-reconnect")
  ],
  dropped_event_count: 1,
  dropped_log_count: 0,
  config_version: "cfg-2026-05-06",
  generated_at: baseTime,
  state_generation: 11
};

export const mockStates: DashboardState[] = [
  paymentsState,
  billingState,
  searchState
];

export function createInitialServerMessages(): ServerMessage[] {
  return [
    {
      type: "session_established",
      session_id: "01HV0000000000000000000200",
      identity: {
        principal: "operator@example.test",
        source: "mtls"
      },
      targets: mockTargets
    },
    ...mockStates.map((state) => ({
      type: "state" as const,
      target_id: state.target.target_id,
      state
    }))
  ];
}

export function createCommandResult(command: ControlCommandRequest): ControlCommandResult {
  return {
    command_id: command.command_id,
    target_id: command.target_id,
    accepted: true,
    status: "completed",
    completed_at: new Date().toISOString(),
    state_delta: {
      runtime_state:
        command.target.child_path && command.command !== "add_child"
          ? [
              runtime(
                command.target.child_path,
                command.command === "pause_child"
                  ? "paused"
                  : command.command === "resume_child"
                    ? "running"
                    : command.command === "quarantine_child"
                      ? "quarantined"
                      : command.command === "restart_child"
                        ? "restarting"
                        : "stopped",
                command.command === "resume_child" ? "healthy" : "stale",
                command.command === "resume_child" ? "ready" : "not_ready",
                command.command === "restart_child" ? 4 : 3,
                undefined,
                `operator command ${command.command}`
              )
            ]
          : undefined
    }
  };
}

export function createAuditEvent(
  command: ControlCommandRequest,
  result: ControlCommandResult
): AuditEvent {
  return {
    audit_id: `audit-${command.command_id}`,
    identity: {
      principal: "operator@example.test",
      source: "mtls"
    },
    target_id: command.target_id,
    command_id: command.command_id,
    command: command.command as ControlCommandName,
    target: command.target,
    reason: command.reason,
    result: result.status,
    occurred_at: result.completed_at
  };
}

export function createCommandEvent(command: ControlCommandRequest): EventRecord {
  const sequence = Math.floor(Date.now() / 1000);
  return event(command.target_id, sequence, "command_completed", "info", command.target.child_path ?? "/root", command.command_id, {
    command: command.command,
    reason: command.reason
  });
}
