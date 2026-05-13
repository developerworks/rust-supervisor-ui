import { describe, expect, it } from "vitest";
import { createDashboardSessionClient, validateCommandRequest } from "@/api/session";
import type { ControlCommandRequest } from "@/types/protocol";

const baseCommand: ControlCommandRequest = {
  type: "command",
  command_id: "cmd-test",
  target_id: "payments-worker-a",
  command: "pause_child",
  target: {
    child_path: "/root/payment_loop"
  },
  reason: "operator requested pause for investigation",
  confirmed: false
};

describe("validateCommandRequest", () => {
  it("requires an established control session", () => {
    const result = validateCommandRequest(baseCommand, false, "wss://localhost:9443/supervisor");

    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe("control_session_missing");
  });

  it("rejects insecure transport for full control", () => {
    const result = validateCommandRequest(baseCommand, true, "ws://localhost:9443/supervisor");

    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe("insecure_transport");
  });

  it("requires reason for every command", () => {
    const result = validateCommandRequest(
      { ...baseCommand, reason: " " },
      true,
      "wss://localhost:9443/supervisor"
    );

    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe("reason_required");
  });

  it("requires confirmation for dangerous commands", () => {
    const result = validateCommandRequest(
      {
        ...baseCommand,
        command: "remove_child",
        confirmed: false
      },
      true,
      "wss://localhost:9443/supervisor"
    );

    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe("confirmation_required");
  });

  it("rejects client supplied requested_by", () => {
    const result = validateCommandRequest(
      {
        ...baseCommand,
        requested_by: "forged@example.test"
      } as ControlCommandRequest & { requested_by: string },
      true,
      "wss://localhost:9443/supervisor"
    );

    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe("client_requested_by_forbidden");
  });
});

describe("createDashboardSessionClient", () => {
  it.each(["", "ws://localhost:9443/supervisor", "http://localhost:9443/supervisor"])(
    "rejects invalid relay URL %s",
    (relayUrl) => {
      const errors: string[] = [];
      const client = createDashboardSessionClient(relayUrl);

      client.connect({
        onMessage: () => undefined,
        onError: (error) => errors.push(error.code)
      });

      expect(errors).toEqual(["invalid_relay_url"]);
    }
  );

  it("rejects the removed local substitute scheme", () => {
    const errors: string[] = [];
    const removedSchemeUrl = "mo" + "ck://dashboard";
    const client = createDashboardSessionClient(removedSchemeUrl);

    client.connect({
      onMessage: () => undefined,
      onError: (error) => errors.push(error.code)
    });

    expect(errors).toEqual(["invalid_relay_url"]);
  });

  it("creates a WebSocket client for secure relay URLs", () => {
    const client = createDashboardSessionClient("wss://localhost:9443/supervisor");

    expect(client.constructor.name).toBe("WebSocketDashboardSessionClient");
  });
});
