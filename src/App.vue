<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";
import DashboardShell from "@/components/dashboard/DashboardShell.vue";
import {
  createDashboardSessionClient,
  validateCommandRequest,
  type SupervisorClientPort
} from "@/api/session";
import { eventStore } from "@/state/eventStore";
import { stateStore } from "@/state/stateStore";
import type { ClientMessage, ControlCommandRequest, ControlCommandResult, ServerMessage } from "@/types/protocol";

const sessionClient = ref<SupervisorClientPort | null>(null);
const relayUrl = import.meta.env.VITE_SUPERVISOR_RELAY_URL || "";
const lastCommandResult = ref<ControlCommandResult | null>(null);
const commandPending = ref(false);
const { t } = useI18n();

const connectionPending = computed(() => stateStore.state.connectionState === "connecting");

function connect(): void {
  sessionClient.value?.close();
  stateStore.reset();
  eventStore.reset();
  lastCommandResult.value = null;
  commandPending.value = false;
  stateStore.state.connectionState = "connecting";
  toast.info(t("toast.connecting"));
  const client = createDashboardSessionClient(relayUrl);
  sessionClient.value = client;
  client.connect({
    onMessage: handleServerMessage,
    onError: (error) => {
      stateStore.addDiagnostic(error);
      toast.error(t("toast.connectionError"));
    },
    onClose: () => {
      stateStore.state.connectionState = "closed";
    }
  });
}

function handleServerMessage(message: ServerMessage): void {
  switch (message.type) {
    case "server_hello":
      stateStore.applyServerHello(message);
      break;
    case "target_list":
      stateStore.applyTargetList(message);
      break;
    case "state":
      stateStore.applyDashboardState(message.target_id, message.state);
      eventStore.applyDashboardState(message.state);
      break;
    case "event":
      eventStore.appendEvent(message.event);
      break;
    case "log":
      eventStore.appendLog(message.log);
      break;
    case "state_delta":
      stateStore.applyStateDelta(message.target_id, message.delta);
      break;
    case "dropped_count":
      eventStore.setDroppedCount(
        message.target_id,
        message.dropped_event_count,
        message.dropped_log_count
      );
      break;
    case "connection_state":
      stateStore.setTargetConnectionState(message.target_id, message.state);
      if (message.state === "unavailable") {
        stateStore.addDiagnostic({
          code: "target_unavailable",
          stage: "session",
          message: `${message.target_id} is unavailable. A fresh state is required before events resume.`,
          target_id: message.target_id,
          retryable: true
        });
      }
      break;
    case "command_result":
      commandPending.value = false;
      lastCommandResult.value = message.result;
      toast.success(t("toast.commandCompleted"));
      if (message.result.state_delta) {
        stateStore.applyStateDelta(message.target_id, message.result.state_delta);
      }
      break;
    case "audit_event":
      eventStore.appendAudit(message.audit);
      break;
    case "error":
      commandPending.value = false;
      stateStore.addDiagnostic(message.error);
      toast.error(message.error.message || t("toast.connectionError"));
      break;
  }
}

function sendClientMessage(message: ClientMessage): void {
  sessionClient.value?.send(message);
}

function sendCommand(request: ControlCommandRequest): void {
  const validation = validateCommandRequest(
    request,
    stateStore.state.controlSessionEstablished,
    relayUrl
  );
  if (!validation.valid && validation.error) {
    stateStore.addDiagnostic(validation.error);
    toast.error(t("toast.commandRejected"));
    return;
  }
  commandPending.value = true;
  toast.info(t("toast.commandSent"));
  sendClientMessage(request);
}

onMounted(connect);

onBeforeUnmount(() => {
  sessionClient.value?.close();
});
</script>

<template>
  <DashboardShell
    :last-command-result="lastCommandResult"
    :command-pending="commandPending"
    :connection-pending="connectionPending"
    @reconnect="connect"
    @filter-update="sendClientMessage"
    @command="sendCommand"
  />
</template>
