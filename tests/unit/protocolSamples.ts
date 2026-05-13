import type { DashboardState, TargetSummary } from "@/types/protocol";

export const validTargetsSample: TargetSummary[] = [
  {
    target_id: "payments-worker-a",
    display_name: "payments worker a",
    registration_state: "active",
    connection_state: "connected",
    supported_commands: [{ name: "restart_child", idempotent: false, timeout_seconds: 30 }]
  },
  {
    target_id: "billing-worker-b",
    display_name: "billing worker b",
    registration_state: "active",
    connection_state: "unavailable",
    supported_commands: [{ name: "restart_child", idempotent: false, timeout_seconds: 30 }]
  }
];

export const validStateSample: DashboardState = {
  target: {
    target_id: "payments-worker-a",
    display_name: "payments worker a"
  },
  topology: {
    root: {
      node_id: "/root",
      path: "/root",
      name: "payments root supervisor",
      kind: "root_supervisor",
      tags: ["payments"],
      criticality: "critical",
      state_summary: "root"
    },
    nodes: [
      {
        node_id: "/root",
        path: "/root",
        name: "payments root supervisor",
        kind: "root_supervisor",
        tags: ["payments"],
        criticality: "critical",
        state_summary: "root"
      },
      {
        node_id: "/root/duplicate_guard",
        child_id: "duplicate_guard",
        path: "/root/duplicate_guard",
        name: "duplicate guard",
        kind: "child_task",
        tags: ["critical"],
        criticality: "critical",
        state_summary: "failed",
        diagnostics: {
          message: "duplicate event window exceeded"
        }
      },
      {
        node_id: "/root/retry_scheduler",
        child_id: "retry_scheduler",
        path: "/root/retry_scheduler",
        name: "retry scheduler",
        kind: "child_task",
        tags: ["retry"],
        criticality: "standard",
        state_summary: "restarting"
      }
    ],
    edges: [
      {
        edge_id: "parent:/root->/root/duplicate_guard",
        source_path: "/root",
        target_path: "/root/duplicate_guard",
        kind: "parent_child",
        order: 0
      },
      {
        edge_id: "parent:/root->/root/retry_scheduler",
        source_path: "/root",
        target_path: "/root/retry_scheduler",
        kind: "parent_child",
        order: 1
      }
    ],
    declaration_order: ["/root", "/root/duplicate_guard", "/root/retry_scheduler"]
  },
  runtime_state: [
    {
      child_path: "/root/duplicate_guard",
      lifecycle_state: "failed",
      health: "unhealthy",
      readiness: "not_ready",
      generation: 1,
      attempt: 3,
      restart_count: 2,
      last_failure: "duplicate event window exceeded",
      last_policy_decision: "quarantine",
      shutdown_state: "idle"
    },
    {
      child_path: "/root/retry_scheduler",
      lifecycle_state: "restarting",
      health: "stale",
      readiness: "not_ready",
      generation: 2,
      attempt: 4,
      restart_count: 3,
      last_policy_decision: "restart",
      shutdown_state: "idle"
    }
  ],
  recent_events: [
    {
      target_id: "payments-worker-a",
      sequence: 1001,
      correlation_id: "startup-1",
      event_type: "child_started",
      severity: "info",
      target_path: "/root/retry_scheduler",
      child_id: "retry_scheduler",
      occurred_at: "2026-05-13T00:00:00Z",
      config_version: "cfg-2026-05-13",
      payload: {}
    },
    {
      target_id: "payments-worker-a",
      sequence: 1002,
      correlation_id: "restart-7",
      event_type: "child_failed",
      severity: "error",
      target_path: "/root/duplicate_guard",
      child_id: "duplicate_guard",
      occurred_at: "2026-05-13T00:00:01Z",
      config_version: "cfg-2026-05-13",
      payload: {}
    },
    {
      target_id: "payments-worker-a",
      sequence: 1003,
      correlation_id: "restart-7",
      event_type: "child_restarted",
      severity: "warning",
      target_path: "/root/retry_scheduler",
      child_id: "retry_scheduler",
      occurred_at: "2026-05-13T00:00:02Z",
      config_version: "cfg-2026-05-13",
      payload: {}
    }
  ],
  recent_logs: [
    {
      target_id: "payments-worker-a",
      sequence: 1002,
      correlation_id: "restart-7",
      severity: "error",
      message: "duplicate event window exceeded",
      fields: {
        child_path: "/root/duplicate_guard"
      },
      occurred_at: "2026-05-13T00:00:01Z"
    }
  ],
  dropped_event_count: 2,
  dropped_log_count: 1,
  config_version: "cfg-2026-05-13",
  generated_at: "2026-05-13T00:00:03Z",
  state_generation: 7
};

export const secondaryStateSample: DashboardState = {
  ...validStateSample,
  target: {
    target_id: "billing-worker-b",
    display_name: "billing worker b"
  },
  topology: {
    ...validStateSample.topology,
    root: {
      ...validStateSample.topology.root,
      name: "billing root supervisor"
    },
    nodes: validStateSample.topology.nodes.map((node) =>
      node.path === "/root" ? { ...node, name: "billing root supervisor" } : node
    )
  },
  runtime_state: [
    {
      child_path: "/root/invoice_writer",
      lifecycle_state: "paused",
      health: "healthy",
      readiness: "ready",
      generation: 1,
      attempt: 1,
      restart_count: 0,
      shutdown_state: "idle"
    }
  ],
  recent_events: [],
  recent_logs: [],
  dropped_event_count: 0,
  dropped_log_count: 0,
  state_generation: 3
};
