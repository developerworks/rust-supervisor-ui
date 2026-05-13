import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import tls from "node:tls";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certDir = path.join(__dirname, "certs");
const server = tls.createServer({
  cert: fs.readFileSync(path.join(certDir, "relay.crt")),
  key: fs.readFileSync(path.join(certDir, "relay.key"))
});

const port = Number(process.env.RELAY_PROTOCOL_PORT ?? 9443);
const host = "127.0.0.1";
const connections = new Set();

server.on("secureConnection", (stream) => {
  let upgraded = false;
  let pending = Buffer.alloc(0);
  connections.add(stream);
  stream.on("close", () => connections.delete(stream));
  stream.on("data", (chunk) => {
    pending = Buffer.concat([pending, chunk]);
    if (!upgraded) {
      const headerEnd = pending.indexOf("\r\n\r\n");
      if (headerEnd < 0) {
        return;
      }
      const headerText = pending.subarray(0, headerEnd).toString("utf8");
      const rest = pending.subarray(headerEnd + 4);
      pending = Buffer.alloc(0);
      if (headerText.startsWith("GET /health ")) {
        stream.end("HTTP/1.1 200 OK\r\ncontent-length: 2\r\n\r\nOK");
        return;
      }
      const key = headerText.match(/^sec-websocket-key:\s*(.+)$/im)?.[1]?.trim();
      if (!key) {
        stream.end("HTTP/1.1 400 Bad Request\r\ncontent-length: 0\r\n\r\n");
        return;
      }
      stream.write(upgradeResponse(key));
      upgraded = true;
      writeJson(stream, serverHello());
      pending = rest;
    }
    if (upgraded && pending.length > 0) {
      const parsed = parseFrames(pending);
      pending = parsed.remaining;
      for (const text of parsed.messages) {
        handleClientMessage(stream, text);
      }
    }
  });
});

server.listen(port, host, () => {
  process.stdout.write(`relay protocol server listening on ${host}:${port}\n`);
});

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

function shutdown() {
  for (const connection of connections) {
    connection.destroy();
  }
  server.close(() => process.exit(0));
}

function upgradeResponse(key) {
  const accept = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");
  return [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
    "\r\n"
  ].join("\r\n");
}

function writeJson(stream, value) {
  stream.write(encodeFrame(JSON.stringify(value)));
}

function encodeFrame(text) {
  const payload = Buffer.from(text, "utf8");
  if (payload.length < 126) {
    return Buffer.concat([Buffer.from([0x81, payload.length]), payload]);
  }
  if (payload.length <= 0xffff) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(payload.length, 2);
    return Buffer.concat([header, payload]);
  }
  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(payload.length), 2);
  return Buffer.concat([header, payload]);
}

function parseFrames(buffer) {
  const messages = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const first = buffer[offset];
    const second = buffer[offset + 1];
    const opcode = first & 0x0f;
    const masked = (second & 0x80) !== 0;
    let length = second & 0x7f;
    let headerLength = 2;
    if (length === 126) {
      if (offset + 4 > buffer.length) {
        break;
      }
      length = buffer.readUInt16BE(offset + 2);
      headerLength = 4;
    } else if (length === 127) {
      if (offset + 10 > buffer.length) {
        break;
      }
      length = Number(buffer.readBigUInt64BE(offset + 2));
      headerLength = 10;
    }
    const maskLength = masked ? 4 : 0;
    const frameLength = headerLength + maskLength + length;
    if (offset + frameLength > buffer.length) {
      break;
    }
    if (opcode === 8) {
      offset += frameLength;
      continue;
    }
    const mask = masked ? buffer.subarray(offset + headerLength, offset + headerLength + 4) : null;
    const payloadStart = offset + headerLength + maskLength;
    const payload = Buffer.from(buffer.subarray(payloadStart, payloadStart + length));
    if (mask) {
      for (let index = 0; index < payload.length; index += 1) {
        payload[index] ^= mask[index % 4];
      }
    }
    if (opcode === 1) {
      messages.push(payload.toString("utf8"));
    }
    offset += frameLength;
  }
  return {
    messages,
    remaining: buffer.subarray(offset)
  };
}

function handleClientMessage(stream, text) {
  const message = JSON.parse(text);
  if (message.type === "client_hello") {
    writeJson(stream, targetList());
    for (const state of dashboardStates()) {
      writeJson(stream, {
        type: "state",
        target_id: state.target.target_id,
        state
      });
    }
    return;
  }
  if (message.type === "log_event_filter_conditions") {
    return;
  }
  if (message.type !== "command") {
    return;
  }
  const result = {
    command_id: message.command_id,
    target_id: message.target_id,
    accepted: true,
    status: "completed",
    completed_at: "2026-05-13T00:01:00Z",
    state_delta: {
      runtime_state: [
        {
          child_path: message.target.child_path ?? "/root",
          lifecycle_state: "stopped",
          health: "unknown",
          readiness: "not_ready",
          generation: 4,
          attempt: 1,
          restart_count: 2,
          shutdown_state: "idle"
        }
      ]
    }
  };
  writeJson(stream, {
    type: "command_result",
    target_id: message.target_id,
    result
  });
  writeJson(stream, {
    type: "audit_event",
    target_id: message.target_id,
    audit: {
      audit_id: `audit-${message.command_id}`,
      identity: {
        principal: "operator@example.test",
        client_identity: "mtls_cert_fingerprint:test-client",
        source: "mtls"
      },
      target_id: message.target_id,
      command_id: message.command_id,
      command: message.command,
      target: message.target,
      reason: message.reason,
      result: "completed",
      occurred_at: "2026-05-13T00:01:00Z"
    }
  });
}

function serverHello() {
  return {
    type: "server_hello",
    session_id: "session-valid-001",
    client_identity: "mtls_cert_fingerprint:test-client",
    log_event_filter_mode: "remote",
    log_event_filter_conditions: {},
    filter_config_version: 1
  };
}

function targetList() {
  return {
    type: "target_list",
    targets: [
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
      },
      {
        target_id: "search-worker-c",
        display_name: "search worker c",
        registration_state: "active",
        connection_state: "reconnecting",
        supported_commands: [{ name: "restart_child", idempotent: false, timeout_seconds: 30 }]
      }
    ]
  };
}

function dashboardStates() {
  return [paymentsState(), billingState(), searchState()];
}

function rootNode(name) {
  return {
    node_id: "/root",
    path: "/root",
    name,
    kind: "root_supervisor",
    tags: ["root"],
    criticality: "critical",
    state_summary: "root"
  };
}

function childNode(pathValue, childId, name, state, diagnostics = undefined) {
  return {
    node_id: pathValue,
    child_id: childId,
    path: pathValue,
    name,
    kind: "child_task",
    tags: ["runtime"],
    criticality: "standard",
    state_summary: state,
    diagnostics
  };
}

function runtime(childPath, lifecycleState, health, readiness, restartCount) {
  return {
    child_path: childPath,
    lifecycle_state: lifecycleState,
    health,
    readiness,
    generation: 1,
    attempt: 1,
    restart_count: restartCount,
    last_failure: lifecycleState === "failed" ? "duplicate event window exceeded" : undefined,
    last_policy_decision: lifecycleState === "failed" ? "quarantine" : "restart",
    shutdown_state: "idle"
  };
}

function event(targetId, sequence, eventType, severity, targetPath, correlationId) {
  return {
    target_id: targetId,
    sequence,
    correlation_id: correlationId,
    event_type: eventType,
    severity,
    target_path: targetPath,
    child_id: targetPath.split("/").at(-1),
    occurred_at: "2026-05-13T00:00:00Z",
    config_version: "cfg-2026-05-13",
    payload: {}
  };
}

function log(targetId, sequence, severity, message, correlationId) {
  return {
    target_id: targetId,
    sequence,
    correlation_id: correlationId,
    severity,
    message,
    fields: {},
    occurred_at: "2026-05-13T00:00:00Z"
  };
}

function topology(rootName, nodes) {
  return {
    root: rootNode(rootName),
    nodes: [rootNode(rootName), ...nodes],
    edges: nodes.map((node, index) => ({
      edge_id: `parent:/root->${node.path}`,
      source_path: "/root",
      target_path: node.path,
      kind: "parent_child",
      order: index
    })),
    declaration_order: ["/root", ...nodes.map((node) => node.path)]
  };
}

function paymentsState() {
  const targetId = "payments-worker-a";
  const duplicateNode = childNode(
    "/root/duplicate_guard",
    "duplicate_guard",
    "duplicate guard",
    "failed",
    { message: "duplicate event window exceeded" }
  );
  const retryNode = childNode("/root/retry_scheduler", "retry_scheduler", "retry scheduler", "restarting");
  return {
    target: {
      target_id: targetId,
      display_name: "payments worker a"
    },
    topology: topology("payments root supervisor", [duplicateNode, retryNode]),
    runtime_state: [
      runtime("/root/duplicate_guard", "failed", "unhealthy", "not_ready", 2),
      runtime("/root/retry_scheduler", "restarting", "stale", "not_ready", 3)
    ],
    recent_events: [
      event(targetId, 1001, "child_started", "info", "/root/retry_scheduler", "startup-1"),
      event(targetId, 1002, "child_failed", "error", "/root/duplicate_guard", "restart-7"),
      event(targetId, 1003, "child_restarted", "warning", "/root/retry_scheduler", "restart-7")
    ],
    recent_logs: [
      log(targetId, 1002, "error", "duplicate event window exceeded", "restart-7")
    ],
    dropped_event_count: 2,
    dropped_log_count: 1,
    config_version: "cfg-2026-05-13",
    generated_at: "2026-05-13T00:00:03Z",
    state_generation: 7
  };
}

function billingState() {
  const targetId = "billing-worker-b";
  const invoiceNode = childNode("/root/invoice_writer", "invoice_writer", "invoice writer", "paused");
  return {
    target: {
      target_id: targetId,
      display_name: "billing worker b"
    },
    topology: topology("billing root supervisor", [invoiceNode]),
    runtime_state: [runtime("/root/invoice_writer", "paused", "healthy", "ready", 0)],
    recent_events: [
      event(targetId, 2001, "child_paused", "warning", "/root/invoice_writer", "billing-1"),
      event(targetId, 2002, "child_resumed", "info", "/root/invoice_writer", "billing-2")
    ],
    recent_logs: [log(targetId, 2002, "info", "invoice writer resumed", "billing-2")],
    dropped_event_count: 0,
    dropped_log_count: 0,
    config_version: "cfg-2026-05-13",
    generated_at: "2026-05-13T00:00:04Z",
    state_generation: 3
  };
}

function searchState() {
  const targetId = "search-worker-c";
  const indexNode = childNode("/root/index_stream", "index_stream", "index stream", "quarantined");
  return {
    target: {
      target_id: targetId,
      display_name: "search worker c"
    },
    topology: topology("search root supervisor", [indexNode]),
    runtime_state: [runtime("/root/index_stream", "quarantined", "unhealthy", "not_ready", 5)],
    recent_events: [
      event(targetId, 3001, "child_quarantined", "warning", "/root/index_stream", "search-1"),
      event(targetId, 3002, "target_reconnecting", "warning", "/root/index_stream", "search-2")
    ],
    recent_logs: [log(targetId, 3002, "warning", "relay is waiting for a fresh state", "search-2")],
    dropped_event_count: 1,
    dropped_log_count: 0,
    config_version: "cfg-2026-05-13",
    generated_at: "2026-05-13T00:00:05Z",
    state_generation: 2
  };
}
