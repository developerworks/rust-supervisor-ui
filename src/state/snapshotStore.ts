import { computed, reactive } from "vue";
import type {
  ConnectionState,
  DashboardError,
  DashboardSnapshot,
  DashboardStateDelta,
  RemoteIdentity,
  RuntimeState,
  ServerMessage,
  SupervisorNode,
  TargetSummary
} from "@/types/protocol";

interface SnapshotStoreState {
  sessionId: string | null;
  identity: RemoteIdentity | null;
  controlSessionEstablished: boolean;
  connectionState: "idle" | "connecting" | "established" | "closed" | "mock";
  targets: TargetSummary[];
  snapshots: Record<string, DashboardSnapshot>;
  selectedTargetId: string | null;
  selectedNodePath: string | null;
  diagnostics: DashboardError[];
}

const state = reactive<SnapshotStoreState>({
  sessionId: null,
  identity: null,
  controlSessionEstablished: false,
  connectionState: "idle",
  targets: [],
  snapshots: {},
  selectedTargetId: null,
  selectedNodePath: null,
  diagnostics: []
});

const selectedTarget = computed(() =>
  state.targets.find((target) => target.target_id === state.selectedTargetId) ?? null
);

const selectedSnapshot = computed(() =>
  state.selectedTargetId ? state.snapshots[state.selectedTargetId] ?? null : null
);

const selectedRuntimeState = computed(() => {
  const snapshot = selectedSnapshot.value;
  if (!snapshot || !state.selectedNodePath) {
    return null;
  }
  return (
    snapshot.runtime_state.find((runtimeState) => runtimeState.child_path === state.selectedNodePath) ??
    null
  );
});

const selectedNode = computed(() => {
  const snapshot = selectedSnapshot.value;
  if (!snapshot || !state.selectedNodePath) {
    return null;
  }
  return (
    snapshot.topology.nodes.find((node) => node.path === state.selectedNodePath) ?? null
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
  const snapshot = selectedSnapshot.value;
  const counts: Record<string, number> = {};
  if (!snapshot) {
    return counts;
  }
  for (const runtimeState of snapshot.runtime_state) {
    counts[runtimeState.lifecycle_state] = (counts[runtimeState.lifecycle_state] ?? 0) + 1;
  }
  return counts;
});

function resetSnapshotStore(): void {
  state.sessionId = null;
  state.identity = null;
  state.controlSessionEstablished = false;
  state.connectionState = "idle";
  state.targets = [];
  state.snapshots = {};
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

function applySnapshot(targetId: string, snapshot: DashboardSnapshot): void {
  state.snapshots[targetId] = snapshot;
  const target = state.targets.find((item) => item.target_id === targetId);
  if (target && target.connection_state !== "unavailable" && target.connection_state !== "expired") {
    target.connection_state = "connected";
  }
  if (!state.selectedTargetId) {
    selectTarget(targetId);
  }
  if (state.selectedTargetId === targetId && !state.selectedNodePath) {
    state.selectedNodePath = snapshot.topology.root.path;
  }
}

function applyStateDelta(targetId: string, delta: DashboardStateDelta): void {
  const snapshot = state.snapshots[targetId];
  if (!snapshot) {
    return;
  }

  if (typeof delta.snapshot_generation === "number") {
    snapshot.snapshot_generation = delta.snapshot_generation;
  }

  if (delta.runtime_state) {
    for (const runtimeState of delta.runtime_state) {
      upsertRuntimeState(snapshot.runtime_state, runtimeState);
      const node = snapshot.topology.nodes.find((item) => item.path === runtimeState.child_path);
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
  const snapshot = state.snapshots[targetId];
  state.selectedNodePath = snapshot?.topology.root.path ?? null;
  const target = state.targets.find((item) => item.target_id === targetId);
  if (target?.connection_state === "unavailable") {
    addDiagnostic({
      code: "target_unavailable",
      stage: "session",
      message: `${target.display_name} is unavailable. A fresh snapshot is required before events resume.`,
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
  return state.snapshots[targetId]?.topology.nodes.find((node) => node.path === nodePath) ?? null;
}

export const snapshotStore = {
  state,
  selectedTarget,
  selectedSnapshot,
  selectedNode,
  selectedRuntimeState,
  selectedNodeDetail,
  stateCounts,
  applySessionEstablished,
  applySnapshot,
  applyStateDelta,
  selectTarget,
  selectNode,
  setTargetConnectionState,
  addDiagnostic,
  findNode,
  reset: resetSnapshotStore
};
