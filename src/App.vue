<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { AlertCircle, LockKeyhole, RadioTower, RefreshCw } from "lucide-vue-next";
import ControlPanel from "@/components/ControlPanel.vue";
import EventLogPanel from "@/components/EventLogPanel.vue";
import FilterBar from "@/components/FilterBar.vue";
import NodeDetailsPanel from "@/components/NodeDetailsPanel.vue";
import TargetList from "@/components/TargetList.vue";
import TopologyCanvas from "@/components/TopologyCanvas.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import Card from "@/components/ui/Card.vue";
import {
  createDashboardSessionClient,
  validateCommandRequest,
  type DashboardSessionClient
} from "@/api/session";
import { eventStore } from "@/state/eventStore";
import { snapshotStore } from "@/state/snapshotStore";
import type { ClientMessage, ControlCommandRequest, ServerMessage } from "@/types/protocol";

const sessionClient = ref<DashboardSessionClient | null>(null);
const relayUrl = import.meta.env.VITE_SUPERVISOR_RELAY_URL || "mock://dashboard";
const lastCommandResult = ref("");

const connectionLabel = computed(() => {
  if (relayUrl.startsWith("mock://")) {
    return "mock session(模拟会话)";
  }
  return relayUrl;
});

function connect(): void {
  snapshotStore.reset();
  eventStore.reset();
  lastCommandResult.value = "";
  snapshotStore.state.connectionState = relayUrl.startsWith("mock://") ? "mock" : "connecting";
  const client = createDashboardSessionClient(relayUrl);
  sessionClient.value = client;
  client.connect({
    onMessage: handleServerMessage,
    onError: (error) => snapshotStore.addDiagnostic(error),
    onClose: () => {
      snapshotStore.state.connectionState = "closed";
    }
  });
}

function handleServerMessage(message: ServerMessage): void {
  switch (message.type) {
    case "session_established":
      snapshotStore.applySessionEstablished(message);
      break;
    case "snapshot":
      snapshotStore.applySnapshot(message.target_id, message.snapshot);
      eventStore.applySnapshot(message.snapshot);
      break;
    case "event":
      eventStore.appendEvent(message.event);
      break;
    case "log":
      eventStore.appendLog(message.log);
      break;
    case "state_delta":
      snapshotStore.applyStateDelta(message.target_id, message.delta);
      break;
    case "dropped_count":
      eventStore.setDroppedCount(
        message.target_id,
        message.dropped_event_count,
        message.dropped_log_count
      );
      break;
    case "connection_state":
      snapshotStore.setTargetConnectionState(message.target_id, message.state);
      if (message.state === "unavailable") {
        snapshotStore.addDiagnostic({
          code: "target_unavailable",
          stage: "session",
          message: `${message.target_id} is unavailable. A fresh snapshot is required before events resume.`,
          target_id: message.target_id,
          retryable: true
        });
      }
      break;
    case "command_result":
      lastCommandResult.value = `${message.result.command_id} ${message.result.status}`;
      if (message.result.state_delta) {
        snapshotStore.applyStateDelta(message.target_id, message.result.state_delta);
      }
      break;
    case "audit_event":
      eventStore.appendAudit(message.audit);
      break;
    case "error":
      snapshotStore.addDiagnostic(message.error);
      break;
  }
}

function sendClientMessage(message: ClientMessage): void {
  sessionClient.value?.send(message);
}

function sendCommand(request: ControlCommandRequest): void {
  const validation = validateCommandRequest(
    request,
    snapshotStore.state.controlSessionEstablished,
    relayUrl
  );
  if (!validation.valid && validation.error) {
    snapshotStore.addDiagnostic(validation.error);
    return;
  }
  sendClientMessage(request);
}

onMounted(connect);

onBeforeUnmount(() => {
  sessionClient.value?.close();
});
</script>

<template>
  <main
    class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-950"
    data-framework="Vue"
    data-component-library="shadcn-vue"
    data-style-framework="Tailwind"
  >
    <header class="border-b bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-xl font-semibold leading-7 tracking-normal text-slate-950">
            Supervisor Dashboard
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            dashboard client(看板客户端) 通过 {{ connectionLabel }} 消费 relay(中继) 会话契约.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Badge variant="success">
            <LockKeyhole class="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {{ snapshotStore.state.identity?.principal ?? "等待身份" }}
          </Badge>
          <Badge variant="outline">
            <RadioTower class="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {{ snapshotStore.state.connectionState }}
          </Badge>
          <Button variant="outline" size="sm" @click="connect">
            <RefreshCw class="h-4 w-4" aria-hidden="true" />
            重新连接
          </Button>
        </div>
      </div>
    </header>

    <div class="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 xl:grid-cols-[20rem_minmax(0,1fr)_24rem]">
      <aside class="relative z-10 space-y-4">
        <TargetList />
        <ControlPanel @command="sendCommand" />
      </aside>

      <section class="relative z-0 min-w-0 space-y-4">
        <FilterBar @filter-update="sendClientMessage" />
        <TopologyCanvas />
        <EventLogPanel />
      </section>

      <aside class="relative z-0 space-y-4">
        <NodeDetailsPanel />
        <Card aria-label="diagnostics">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <p class="muted-label">diagnostics(诊断)</p>
              <h2 class="panel-title">会话诊断</h2>
            </div>
            <AlertCircle class="h-5 w-5 text-slate-500" aria-hidden="true" />
          </div>
          <p v-if="lastCommandResult" class="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800">
            command result(命令结果): {{ lastCommandResult }}
          </p>
          <div v-if="snapshotStore.state.diagnostics.length === 0" class="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            当前没有结构化错误.
          </div>
          <ul v-else class="space-y-2" data-testid="diagnostics">
            <li v-for="error in snapshotStore.state.diagnostics" :key="`${error.code}:${error.message}`" class="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p class="font-semibold">{{ error.code }}</p>
              <p class="mt-1 leading-5">{{ error.message }}</p>
            </li>
          </ul>
        </Card>
      </aside>
    </div>
  </main>
</template>
