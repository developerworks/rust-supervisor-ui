import { computed, reactive } from "vue";
import type {
  ConnectionState,
  DashboardError,
  DashboardState,
  DashboardStateDelta,
  RemoteIdentity,
  RuntimeState,
  ServerMessage,
  SupervisorNode,
  TargetSummary
} from "@/types/protocol";

interface DashboardStateStore {
  sessionId: string | null;
  identity: RemoteIdentity | null;
  controlSessionEstablished: boolean;
  connectionState: "idle" | "connecting" | "established" | "closed" | "mock";
  targets: TargetSummary[];
  states: Record<string, DashboardState>;
  selectedTargetId: string | null;
  selectedNodePath: string | null;
  diagnostics: DashboardError[];
}

const state = reactive<DashboardStateStore>({
  sessionId: null,
  identity: null,
  controlSessionEstablished: false,
  connectionState: "idle",
  targets: [],
  states: {},
  selectedTargetId: null,
  selectedNodePath: null,
  diagnostics: []
});

const selectedTarget = computed(() =>
  state.targets.find((target) => target.target_id === state.selectedTargetId) ?? null
);

const selectedDashboardState = computed(() =>
  state.selectedTargetId ? state.states[state.selectedTargetId] ?? null : null
);

const selectedRuntimeState = computed(() => {
  const dashboardState = selectedDashboardState.value;
  if (!dashboardState || !state.selectedNodePath) {
    return null;
  }
  return (
    dashboardState.runtime_state.find((runtimeState) => runtimeState.child_path === state.selectedNodePath) ??
    null
  );
});

const selectedNode = computed(() => {
  const dashboardState = selectedDashboardState.value;
  if (!dashboardState || !state.selectedNodePath) {
    return null;
  }
  return (
    dashboardState.topology.nodes.find((node) => node.path === state.selectedNodePath) ?? null
  );
});

const selectedNodeDetail = computed(() => {
  const node = selectedNode.value;
  if (!node) {
    return null;
  }
  return {
    node,
    runtimeState: selectedRuntimeState.value
  };
});

const stateCounts = computed(() => {
  const dashboardState = selectedDashboardState.value;
  const counts: Record<string, number> = {};
  if (!dashboardState) {
    return counts;
  }
  for (const runtimeState of dashboardState.runtime_state) {
    counts[runtimeState.lifecycle_state] = (counts[runtimeState.lifecycle_state] ?? 0) + 1;
  }
  return counts;
});

function resetDashboardStateStore(): void {
  state.sessionId = null;
  state.identity = null;
  state.controlSessionEstablished = false;
  state.connectionState = "idle";
  state.targets = [];
  state.states = {};
  state.selectedTargetId = null;
  state.selectedNodePath = null;
  state.diagnostics = [];
}

function applySessionEstablished(message: Extract<ServerMessage, { type: "session_established" }>): void {
  state.sessionId = message.session_id;
  state.identity = message.identity;
  state.controlSessionEstablished = true;
  state.connectionState = "established";
  state.targets = message.targets;

  const firstConnected =
    message.targets.find((target) => target.connection_state === "connected") ?? message.targets[0];
  if (firstConnected) {
    selectTarget(firstConnected.target_id);
  }
}

function applyDashboardState(targetId: string, dashboardState: DashboardState): void {
  state.states[targetId] = dashboardState;
  const target = state.targets.find((item) => item.target_id === targetId);
  if (target && target.connection_state !== "unavailable" && target.connection_state !== "expired") {
    target.connection_state = "connected";
  }
  if (!state.selectedTargetId) {
    selectTarget(targetId);
  }
  if (state.selectedTargetId === targetId && !state.selectedNodePath) {
    state.selectedNodePath = dashboardState.topology.root.path;
  }
}

function applyStateDelta(targetId: string, delta: DashboardStateDelta): void {
  const dashboardState = state.states[targetId];
  if (!dashboardState) {
    return;
  }

  if (typeof delta.state_generation === "number") {
    dashboardState.state_generation = delta.state_generation;
  }

  if (delta.runtime_state) {
    for (const runtimeState of delta.runtime_state) {
      upsertRuntimeState(dashboardState.runtime_state, runtimeState);
      const node = dashboardState.topology.nodes.find((item) => item.path === runtimeState.child_path);
      if (node) {
        node.state_summary = runtimeState.lifecycle_state;
      }
    }
  }

  if (delta.connection_state) {
    setTargetConnectionState(targetId, delta.connection_state);
  }
}

function upsertRuntimeState(states: RuntimeState[], next: RuntimeState): void {
  const index = states.findIndex((item) => item.child_path === next.child_path);
  if (index >= 0) {
    states[index] = next;
  } else {
    states.push(next);
  }
}

function selectTarget(targetId: string): void {
  state.selectedTargetId = targetId;
  const dashboardState = state.states[targetId];
  state.selectedNodePath = dashboardState?.topology.root.path ?? null;
  const target = state.targets.find((item) => item.target_id === targetId);
  if (target?.connection_state === "unavailable") {
    addDiagnostic({
      code: "target_unavailable",
      stage: "session",
      message: `${target.display_name} is unavailable. A fresh state is required before events resume.`,
      target_id: target.target_id,
      retryable: true
    });
  }
}

function selectNode(nodePath: string): void {
  state.selectedNodePath = nodePath;
}

function setTargetConnectionState(targetId: string, connectionState: ConnectionState): void {
  const target = state.targets.find((item) => item.target_id === targetId);
  if (target) {
    target.connection_state = connectionState;
  }
}

function addDiagnostic(error: DashboardError): void {
  const exists = state.diagnostics.some(
    (item) => item.code === error.code && item.target_id === error.target_id && item.message === error.message
  );
  if (!exists) {
    state.diagnostics.unshift(error);
  }
  state.diagnostics = state.diagnostics.slice(0, 6);
}

function findNode(targetId: string, nodePath: string): SupervisorNode | null {
  return state.states[targetId]?.topology.nodes.find((node) => node.path === nodePath) ?? null;
}

export const stateStore = {
  state,
  selectedTarget,
  selectedDashboardState,
  selectedNode,
  selectedRuntimeState,
  selectedNodeDetail,
  stateCounts,
  applySessionEstablished,
  applyDashboardState,
  applyStateDelta,
  selectTarget,
  selectNode,
  setTargetConnectionState,
  addDiagnostic,
  findNode,
  reset: resetDashboardStateStore
};
