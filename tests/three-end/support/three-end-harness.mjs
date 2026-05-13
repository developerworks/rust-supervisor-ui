import fs from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import tls from "node:tls";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uiRoot = path.resolve(__dirname, "../../..");
const workspaceRoot = path.resolve(uiRoot, "..");
const relayRoot = path.join(workspaceRoot, "rust-supervisor-relay");
const supervisorRoot = path.join(workspaceRoot, "rust-supervisor");
const runtimeDir = process.env.THREE_END_RUNTIME_DIR ?? "/tmp/rust-supervisor-demo";
const registrationSocket = path.join(runtimeDir, "dashboard-relay-registration.sock");
const supervisorIpcSocket = path.join(runtimeDir, "payments-worker-a.sock");
const logDir = path.join(uiRoot, "test-results", "three-end");
const certDir = path.join(uiRoot, "tests", "three-end", "certs");
const relayCertDir = path.join(relayRoot, "examples", "certs");

let relayProcess = null;
let supervisorProcess = null;
let ready = false;
let readyError = "three-end harness is starting";
let shuttingDown = false;

fs.mkdirSync(runtimeDir, { recursive: true });
fs.mkdirSync(logDir, { recursive: true });

assertFile(path.join(relayCertDir, "relay.crt"));
assertFile(path.join(relayCertDir, "relay.key"));
assertFile(path.join(relayCertDir, "operators-ca.crt"));
assertFile(path.join(certDir, "operator.crt"));
assertFile(path.join(certDir, "operator.key"));

const healthServer = http.createServer((request, response) => {
  if (request.url !== "/health") {
    response.writeHead(404);
    response.end("not found");
    return;
  }
  if (ready) {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("OK");
    return;
  }
  response.writeHead(503, { "content-type": "text/plain" });
  response.end(readyError);
});

healthServer.listen(39551, "127.0.0.1", () => {
  process.stdout.write("three-end harness health server listening on 127.0.0.1:39551\n");
});

process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));
process.on("exit", () => {
  stopChild(relayProcess);
  stopChild(supervisorProcess);
  cleanupRuntimeFiles();
});

try {
  relayProcess = startRelay();
  await waitFor(() => fileExists(registrationSocket), "registration socket");
  await waitFor(() => relayTlsHandshake(), "relay TLS handshake");

  supervisorProcess = startSupervisor();
  await waitFor(() => fileExists(supervisorIpcSocket), "supervisor IPC socket");

  ready = true;
  readyError = "";
  process.stdout.write("three-end harness ready\n");
} catch (error) {
  ready = false;
  readyError = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${readyError}\n`);
  shutdown(1);
}

function startRelay() {
  return startChild(
    "relay",
    "cargo",
    [
      "run",
      "--manifest-path",
      path.join(relayRoot, "Cargo.toml"),
      "--",
      "--config",
      "examples/config/dashboard-relay.local.yaml"
    ],
    relayRoot
  );
}

function startSupervisor() {
  return startChild(
    "supervisor",
    "cargo",
    [
      "run",
      "--manifest-path",
      path.join(supervisorRoot, "Cargo.toml"),
      "--example",
      "demo",
      "--",
      "--config",
      "examples/config/supervisor.local.yaml"
    ],
    supervisorRoot
  );
}

function startChild(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, RUST_BACKTRACE: process.env.RUST_BACKTRACE ?? "1" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const logPath = path.join(logDir, `${name}.log`);
  const log = fs.createWriteStream(logPath, { flags: "w" });
  child.stdout.pipe(log, { end: false });
  child.stderr.pipe(log, { end: false });
  child.stdout.on("data", (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on("exit", (code, signal) => {
    log.end();
    if (!shuttingDown) {
      ready = false;
      readyError = `${name} exited with code ${code ?? "none"} and signal ${signal ?? "none"}`;
      process.stderr.write(`${readyError}\n`);
      process.exitCode = 1;
    }
  });
  return child;
}

async function waitFor(check, label) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 120_000) {
    assertProcessAlive(relayProcess, "relay");
    if (supervisorProcess) {
      assertProcessAlive(supervisorProcess, "supervisor");
    }
    if (await check()) {
      return;
    }
    await sleep(250);
  }
  throw new Error(`timed out waiting for ${label}`);
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function relayTlsHandshake() {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: "localhost",
        port: 9443,
        servername: "localhost",
        ca: fs.readFileSync(path.join(certDir, "operators-ca.crt")),
        cert: fs.readFileSync(path.join(certDir, "operator.crt")),
        key: fs.readFileSync(path.join(certDir, "operator.key")),
        rejectUnauthorized: true,
        timeout: 1000
      },
      () => {
        socket.end();
        resolve(true);
      }
    );
    socket.once("error", () => resolve(false));
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function assertFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`required file does not exist: ${filePath}`);
  }
}

function assertProcessAlive(child, name) {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    throw new Error(`${name} process is not running`);
  }
}

function stopChild(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return;
  }
  child.kill("SIGTERM");
}

function shutdown(exitCode) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  ready = false;
  healthServer.close();
  stopChild(supervisorProcess);
  stopChild(relayProcess);
  cleanupRuntimeFiles();
  setTimeout(() => {
    cleanupRuntimeFiles();
    process.exit(exitCode);
  }, 500).unref();
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function cleanupRuntimeFiles() {
  for (const filePath of [registrationSocket, supervisorIpcSocket]) {
    try {
      fs.rmSync(filePath, { force: true });
    } catch {
      continue;
    }
  }
}
