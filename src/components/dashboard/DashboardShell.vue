<script setup lang="ts">
import DashboardLayout from "@/components/dashboard/DashboardLayout.vue";
import { PageShell } from "@/components/layout";
import { Toaster } from "@/components/ui/sonner";
import type { ClientMessage, ControlCommandRequest, ControlCommandResult } from "@/types/protocol";

defineProps<{
  lastCommandResult: ControlCommandResult | null;
  commandPending: boolean;
  connectionPending: boolean;
}>();

const emit = defineEmits<{
  reconnect: [];
  filterUpdate: [message: ClientMessage];
  command: [request: ControlCommandRequest];
}>();
</script>

<template>
  <PageShell
    data-framework="Vue"
    data-component-library="shadcn-vue"
    data-style-framework="Tailwind"
  >
    <DashboardLayout
      :last-command-result="lastCommandResult"
      :command-pending="commandPending"
      :connection-pending="connectionPending"
      @reconnect="emit('reconnect')"
      @filter-update="(message) => emit('filterUpdate', message)"
      @command="(request) => emit('command', request)"
    />
    <Toaster rich-colors close-button />
  </PageShell>
</template>
