import {
  createAuditEvent,
  createCommandEvent,
  createCommandResult,
  createInitialServerMessages
} from "@/mock/dashboardData";
import type {
  ClientMessage,
  ControlCommandRequest,
  DashboardError,
  ServerMessage
} from "@/types/protocol";
import { isControlCommandName, isDangerousCommandName } from "@/types/protocol";

export interface DashboardSessionHandlers {
  onMessage(message: ServerMessage): void;
  onError(error: DashboardError): void;
  onClose?(): void;
}

export interface DashboardSessionClient {
  connect(handlers: DashboardSessionHandlers): void;
  send(message: ClientMessage): void;
  close(): void;
}

export interface CommandValidationResult {
  valid: boolean;
  error?: DashboardError;
}

export function createDashboardSessionClient(url = defaultRelayUrl()): DashboardSessionClient {
  if (url.startsWith("mock://")) {
    return new MockDashboardSessionClient();
  }
  return new WebSocketDashboardSessionClient(url);
}

export function validateCommandRequest(
  request: ControlCommandRequest,
  controlSessionEstablished: boolean,
  relayUrl = defaultRelayUrl()
): CommandValidationResult {
  const rawRequest = request as ControlCommandRequest & { requested_by?: unknown };
  if (!controlSessionEstablished) {
    return invalid("control_session_missing", "session", "Control session is not established.");
  }
  if (!relayUrl.startsWith("wss://") && !relayUrl.startsWith("mock://")) {
    return invalid("insecure_transport", "transport", "Full control requires wss:// transport.");
  }
  if (!isControlCommandName(request.command)) {
    return invalid("unknown_command", "command", "Command is not part of the dashboard contract.");
  }
  if (typeof rawRequest.requested_by !== "undefined") {
    return invalid("client_requested_by_forbidden", "command", "Client cannot provide requested_by.");
  }
  if (!request.reason.trim()) {
    return invalid("reason_required", "command", "Reason is required for every command.");
  }
  if (isDangerousCommandName(request.command) && !request.confirmed) {
    return invalid("confirmation_required", "command", "Dangerous command requires confirmation.");
  }
  if (request.command !== "shutdown_tree" && !request.target.child_path && !request.target.child_id) {
    return invalid("target_required", "command", "Child target is required for this command.");
  }
  return { valid: true };
}

function defaultRelayUrl(): string {
  return import.meta.env.VITE_SUPERVISOR_RELAY_URL || "mock://dashboard";
}

function invalid(code: string, stage: string, message: string): CommandValidationResult {
  return {
    valid: false,
    error: {
      code,
      stage,
      message,
      retryable: false
    }
  };
}

class MockDashboardSessionClient implements DashboardSessionClient {
  private handlers: DashboardSessionHandlers | null = null;
  private timers: number[] = [];

  connect(handlers: DashboardSessionHandlers): void {
    this.handlers = handlers;
    createInitialServerMessages().forEach((message, index) => {
      const timer = window.setTimeout(() => handlers.onMessage(message), index * 30);
      this.timers.push(timer);
    });
  }

  send(message: ClientMessage): void {
    if (!this.handlers) {
      return;
    }
    if (message.type === "filter_update") {
      return;
    }
    const validation = validateCommandRequest(message, true, "mock://dashboard");
    if (!validation.valid && validation.error) {
      this.handlers.onError(validation.error);
      return;
    }
    const result = createCommandResult(message);
    const audit = createAuditEvent(message, result);
    const commandEvent = createCommandEvent(message);
    this.handlers.onMessage({
      type: "command_result",
      target_id: message.target_id,
      result
    });
    this.handlers.onMessage({
      type: "state_delta",
      target_id: message.target_id,
      delta: result.state_delta ?? {}
    });
    this.handlers.onMessage({
      type: "audit_event",
      target_id: message.target_id,
      audit
    });
    this.handlers.onMessage({
      type: "event",
      target_id: message.target_id,
      event: commandEvent
    });
  }

  close(): void {
    for (const timer of this.timers) {
      window.clearTimeout(timer);
    }
    this.timers = [];
    this.handlers?.onClose?.();
    this.handlers = null;
  }
}

class WebSocketDashboardSessionClient implements DashboardSessionClient {
  private socket: WebSocket | null = null;
  private handlers: DashboardSessionHandlers | null = null;

  constructor(private readonly url: string) {}

  connect(handlers: DashboardSessionHandlers): void {
    this.handlers = handlers;
    if (!this.url.startsWith("wss://")) {
      handlers.onError({
        code: "insecure_transport",
        stage: "transport",
        message: "Full control requires wss:// transport.",
        retryable: false
      });
      return;
    }
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("message", (event) => {
      try {
        handlers.onMessage(JSON.parse(event.data) as ServerMessage);
      } catch {
        handlers.onError({
          code: "invalid_server_message",
          stage: "protocol",
          message: "Server message is not valid JSON.",
          retryable: true
        });
      }
    });
    this.socket.addEventListener("error", () => {
      handlers.onError({
        code: "websocket_error",
        stage: "transport",
        message: "WebSocket connection failed.",
        retryable: true
      });
    });
    this.socket.addEventListener("close", () => handlers.onClose?.());
  }

  send(message: ClientMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      return;
    }
    this.handlers?.onError({
      code: "websocket_not_open",
      stage: "transport",
      message: "WebSocket connection is not open.",
      retryable: true
    });
  }

  close(): void {
    this.socket?.close();
    this.socket = null;
  }
}
