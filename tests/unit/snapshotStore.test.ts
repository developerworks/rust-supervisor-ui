import { describe, expect, it, beforeEach } from "vitest";
import { billingSnapshot, paymentsSnapshot, mockTargets } from "@/mock/dashboardData";
import { snapshotStore } from "@/state/snapshotStore";

describe("snapshotStore", () => {
  beforeEach(() => {
    snapshotStore.reset();
  });

  it("stores session targets and selects the first connected target", () => {
    snapshotStore.applySessionEstablished({
      type: "session_established",
      session_id: "session-test",
      identity: {
        principal: "operator@example.test",
        source: "mtls"
      },
      targets: mockTargets
    });

    expect(snapshotStore.state.controlSessionEstablished).toBe(true);
    expect(snapshotStore.state.selectedTargetId).toBe("payments-worker-a");
  });

  it("applies snapshots and node selection", () => {
    snapshotStore.applySessionEstablished({
      type: "session_established",
      session_id: "session-test",
      identity: {
        principal: "operator@example.test",
        source: "mtls"
      },
      targets: mockTargets
    });
    snapshotStore.applySnapshot("payments-worker-a", paymentsSnapshot);
    snapshotStore.selectNode("/root/duplicate_guard");

    expect(snapshotStore.selectedNode.value?.name).toBe("duplicate guard");
    expect(snapshotStore.selectedRuntimeState.value?.lifecycle_state).toBe("failed");
  });

  it("adds diagnostics for unavailable targets", () => {
    snapshotStore.applySessionEstablished({
      type: "session_established",
      session_id: "session-test",
      identity: {
        principal: "operator@example.test",
        source: "mtls"
      },
      targets: mockTargets
    });
    snapshotStore.applySnapshot("billing-worker-b", billingSnapshot);
    snapshotStore.selectTarget("billing-worker-b");

    expect(snapshotStore.state.diagnostics[0].code).toBe("target_unavailable");
  });

  it("updates connection state from relay stream messages", () => {
    snapshotStore.applySessionEstablished({
      type: "session_established",
      session_id: "session-test",
      identity: {
        principal: "operator@example.test",
        source: "mtls"
      },
      targets: mockTargets
    });

    snapshotStore.setTargetConnectionState("payments-worker-a", "reconnecting");

    expect(snapshotStore.state.targets[0].connection_state).toBe("reconnecting");
  });
});
