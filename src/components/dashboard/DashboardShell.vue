<script setup lang="ts">
import DashboardHeader from "@/components/dashboard/DashboardHeader.vue";
import DashboardLayout from "@/components/dashboard/DashboardLayout.vue";
import { Toaster } from "@/components/ui/sonner";
import type { ClientMessage, ControlCommandRequest, ControlCommandResult } from "@/types/protocol";

defineProps<{
  connectionLabel: string;
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
  <main
    class="dashboard-shell min-h-screen text-foreground"
    data-framework="Vue"
    data-component-library="shadcn-vue"
    data-style-framework="Tailwind"
  >
    <DashboardHeader
      :connection-label="connectionLabel"
      :connection-pending="connectionPending"
      @reconnect="emit('reconnect')"
    />
    <DashboardLayout
      :last-command-result="lastCommandResult"
      :command-pending="commandPending"
      @filter-update="(message) => emit('filterUpdate', message)"
      @command="(request) => emit('command', request)"
    />
    <Toaster rich-colors close-button />
  </main>
</template>
