import { describe, expect, it } from "vitest";
import { validateCommandRequest } from "@/api/session";
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
    const result = validateCommandRequest(baseCommand, false, "mock://dashboard");

    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe("control_session_missing");
  });

  it("rejects insecure transport for full control", () => {
    const result = validateCommandRequest(baseCommand, true, "ws://localhost:9443/supervisor");

    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe("insecure_transport");
  });

  it("requires reason for every command", () => {
    const result = validateCommandRequest({ ...baseCommand, reason: " " }, true, "mock://dashboard");

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
      "mock://dashboard"
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
      "mock://dashboard"
    );

    expect(result.valid).toBe(false);
    expect(result.error?.code).toBe("client_requested_by_forbidden");
  });
});
