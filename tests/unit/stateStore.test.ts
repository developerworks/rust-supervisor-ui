import { describe, expect, it, beforeEach } from "vitest";
import { billingState, paymentsState, mockTargets } from "@/mock/dashboardData";
import { stateStore } from "@/state/stateStore";

describe("stateStore", () => {
  beforeEach(() => {
    stateStore.reset();
  });

  it("stores session targets and selects the first connected target", () => {
    stateStore.applySessionEstablished({
      type: "session_established",
      session_id: "session-test",
      identity: {
        principal: "operator@example.test",
        source: "mtls"
      },
      targets: mockTargets
    });

    expect(stateStore.state.controlSessionEstablished).toBe(true);
    expect(stateStore.state.selectedTargetId).toBe("payments-worker-a");
  });

  it("applies states and node selection", () => {
    stateStore.applySessionEstablished({
      type: "session_established",
      session_id: "session-test",
      identity: {
        principal: "operator@example.test",
        source: "mtls"
      },
      targets: mockTargets
    });
    stateStore.applyDashboardState("payments-worker-a", paymentsState);
    stateStore.selectNode("/root/duplicate_guard");

    expect(stateStore.selectedNode.value?.name).toBe("duplicate guard");
    expect(stateStore.selectedRuntimeState.value?.lifecycle_state).toBe("failed");
  });

  it("adds diagnostics for unavailable targets", () => {
    stateStore.applySessionEstablished({
      type: "session_established",
      session_id: "session-test",
      identity: {
        principal: "operator@example.test",
        source: "mtls"
      },
      targets: mockTargets
    });
    stateStore.applyDashboardState("billing-worker-b", billingState);
    stateStore.selectTarget("billing-worker-b");

    expect(stateStore.state.diagnostics[0].code).toBe("target_unavailable");
  });

  it("updates connection state from relay stream messages", () => {
    stateStore.applySessionEstablished({
      type: "session_established",
      session_id: "session-test",
      identity: {
        principal: "operator@example.test",
        source: "mtls"
      },
      targets: mockTargets
    });

    stateStore.setTargetConnectionState("payments-worker-a", "reconnecting");

    expect(stateStore.state.targets[0].connection_state).toBe("reconnecting");
  });
});
