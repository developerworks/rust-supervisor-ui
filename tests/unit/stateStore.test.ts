import { describe, expect, it, beforeEach } from "vitest";
import { stateStore } from "@/state/stateStore";
import { secondaryStateSample, validStateSample, validTargetsSample } from "./protocolSamples";

const emptyConditions = {
  target_ids: [],
  child_paths: [],
  lifecycle_states: [],
  event_types: [],
  severities: []
};

describe("stateStore", () => {
  beforeEach(() => {
    stateStore.reset();
  });

  it("stores session targets and selects the first connected target", () => {
    stateStore.applyServerHello({
      type: "server_hello",
      session_id: "session-test",
      client_identity: "mtls_cert_fingerprint:test-client",
      log_event_filter_mode: "remote",
      log_event_filter_conditions: emptyConditions,
      filter_config_version: 1
    });
    stateStore.applyTargetList({
      type: "target_list",
      targets: validTargetsSample
    });

    expect(stateStore.state.controlSessionEstablished).toBe(true);
    expect(stateStore.state.selectedTargetId).toBe("payments-worker-a");
  });

  it("applies states and node selection", () => {
    stateStore.applyServerHello({
      type: "server_hello",
      session_id: "session-test",
      client_identity: "mtls_cert_fingerprint:test-client",
      log_event_filter_mode: "remote",
      log_event_filter_conditions: emptyConditions,
      filter_config_version: 1
    });
    stateStore.applyTargetList({
      type: "target_list",
      targets: validTargetsSample
    });
    stateStore.applyDashboardState("payments-worker-a", validStateSample);
    stateStore.selectNode("/root/duplicate_guard");

    expect(stateStore.selectedNode.value?.name).toBe("duplicate guard");
    expect(stateStore.selectedRuntimeState.value?.lifecycle_state).toBe("failed");
  });

  it("adds diagnostics for unavailable targets", () => {
    stateStore.applyServerHello({
      type: "server_hello",
      session_id: "session-test",
      client_identity: "mtls_cert_fingerprint:test-client",
      log_event_filter_mode: "remote",
      log_event_filter_conditions: emptyConditions,
      filter_config_version: 1
    });
    stateStore.applyTargetList({
      type: "target_list",
      targets: validTargetsSample
    });
    stateStore.applyDashboardState("billing-worker-b", secondaryStateSample);
    stateStore.selectTarget("billing-worker-b");

    expect(stateStore.state.diagnostics[0].code).toBe("target_unavailable");
  });

  it("updates connection state from relay stream messages", () => {
    stateStore.applyServerHello({
      type: "server_hello",
      session_id: "session-test",
      client_identity: "mtls_cert_fingerprint:test-client",
      log_event_filter_mode: "remote",
      log_event_filter_conditions: emptyConditions,
      filter_config_version: 1
    });
    stateStore.applyTargetList({
      type: "target_list",
      targets: validTargetsSample
    });

    stateStore.setTargetConnectionState("payments-worker-a", "reconnecting");

    expect(stateStore.state.targets[0].connection_state).toBe("reconnecting");
  });

  it("replaces topology and runtime rows from command state delta", () => {
    stateStore.applyServerHello({
      type: "server_hello",
      session_id: "session-test",
      client_identity: "mtls_cert_fingerprint:test-client",
      log_event_filter_mode: "remote",
      log_event_filter_conditions: emptyConditions,
      filter_config_version: 1
    });
    stateStore.applyTargetList({
      type: "target_list",
      targets: validTargetsSample
    });
    stateStore.applyDashboardState("payments-worker-a", validStateSample);
    stateStore.selectNode("/root/duplicate_guard");

    stateStore.applyStateDelta("payments-worker-a", {
      topology: {
        ...validStateSample.topology,
        nodes: validStateSample.topology.nodes.filter((node) => node.path !== "/root/duplicate_guard"),
        edges: validStateSample.topology.edges.filter((edge) => edge.target_path !== "/root/duplicate_guard"),
        declaration_order: validStateSample.topology.declaration_order.filter(
          (path) => path !== "/root/duplicate_guard"
        )
      },
      runtime_state: validStateSample.runtime_state.filter(
        (runtimeState) => runtimeState.child_path !== "/root/duplicate_guard"
      ),
      state_generation: 7
    });

    expect(stateStore.findNode("payments-worker-a", "/root/duplicate_guard")).toBeNull();
    expect(
      stateStore.state.states["payments-worker-a"].runtime_state.some(
        (runtimeState) => runtimeState.child_path === "/root/duplicate_guard"
      )
    ).toBe(false);
    expect(stateStore.state.selectedNodePath).toBe("/root");
  });
});
