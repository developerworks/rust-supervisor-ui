<script setup lang="ts">
import TopologyCanvas from "@/components/TopologyCanvas.vue";
import DashboardBlockingAlert from "@/components/dashboard/DashboardBlockingAlert.vue";
import DashboardInspector from "@/components/dashboard/DashboardInspector.vue";
import DashboardLogWorkspace from "@/components/dashboard/DashboardLogWorkspace.vue";
import DashboardStatusStrip from "@/components/dashboard/DashboardStatusStrip.vue";
import { Box, Grid, Section, Stack } from "@/components/layout";
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

function showDiagnostics(): void {
  requestAnimationFrame(() => {
    document.getElementById("dashboard-diagnostics-panel")?.scrollIntoView({ block: "start", behavior: "smooth" });
  });
}
</script>

<template>
  <Box class="w-full max-w-none px-4 py-4" data-testid="dashboard-layout">
    <Stack gap="lg" class="min-h-[calc(100svh-6.5rem)] min-w-0">
      <DashboardBlockingAlert @show-diagnostics="showDiagnostics" />
      <DashboardStatusStrip
        :connection-pending="connectionPending"
        @reconnect="emit('reconnect')"
      />

      <Grid
        class="min-w-0 items-start gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]"
        data-testid="dashboard-standard-layout"
      >
        <Section id="dashboard-context-panel" as="aside" class="min-w-0" data-testid="dashboard-left-rail">
          <DashboardInspector
            :command-pending="commandPending"
            :last-command-result="lastCommandResult"
            @command="(request) => emit('command', request)"
          />
        </Section>

        <Stack gap="lg" class="min-w-0" data-testid="dashboard-main-column">
          <Section class="min-w-0" data-testid="dashboard-main-content">
            <TopologyCanvas />
          </Section>

          <Section class="min-w-0">
            <DashboardLogWorkspace @filter-update="(message) => emit('filterUpdate', message)" />
          </Section>
        </Stack>
      </Grid>
    </Stack>
  </Box>
</template>
