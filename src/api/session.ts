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
  if (!isSecureRelayUrl(url)) {
    return new ConfigurationErrorDashboardSessionClient(url);
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
  if (!isSecureRelayUrl(relayUrl)) {
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
  return import.meta.env.VITE_SUPERVISOR_RELAY_URL || "";
}

function isSecureRelayUrl(url: string): boolean {
  return url.trim().startsWith("wss://");
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

class ConfigurationErrorDashboardSessionClient implements DashboardSessionClient {
  constructor(private readonly url: string) {}

  connect(handlers: DashboardSessionHandlers): void {
    handlers.onError({
      code: "invalid_relay_url",
      stage: "configuration",
      message: invalidRelayUrlMessage(this.url),
      retryable: false
    });
    handlers.onClose?.();
  }

  send(): void {
    return;
  }

  close(): void {
    return;
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

function invalidRelayUrlMessage(url: string): string {
  if (!url.trim()) {
    return "VITE_SUPERVISOR_RELAY_URL is required and must use wss://.";
  }
  return "VITE_SUPERVISOR_RELAY_URL must use wss://.";
}
