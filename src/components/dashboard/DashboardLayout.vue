<script setup lang="ts">
import { ref } from "vue";
import TopologyCanvas from "@/components/TopologyCanvas.vue";
import DashboardBlockingAlert from "@/components/dashboard/DashboardBlockingAlert.vue";
import DashboardBottomPanel from "@/components/dashboard/DashboardBottomPanel.vue";
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

const inspectorTab = ref("targets");
const bottomTab = ref("runtime");

function showDiagnostics(): void {
  bottomTab.value = "diagnostics";
  requestAnimationFrame(() => {
    document.getElementById("dashboard-bottom-panel")?.scrollIntoView({ block: "start", behavior: "smooth" });
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
        class="min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_24rem_24rem]"
        data-testid="dashboard-standard-layout"
      >
        <Section class="min-w-0" data-testid="dashboard-main-content">
          <TopologyCanvas />
        </Section>

        <Section as="aside" class="min-w-0" data-testid="dashboard-right-rail">
          <DashboardInspector
            v-model="inspectorTab"
            :command-pending="commandPending"
            @command="(request) => emit('command', request)"
          />
        </Section>

        <Section id="dashboard-bottom-panel" class="min-w-0">
          <DashboardBottomPanel
            v-model="bottomTab"
            :last-command-result="lastCommandResult"
          />
        </Section>

        <Section class="min-w-0 xl:col-span-3">
          <DashboardLogWorkspace @filter-update="(message) => emit('filterUpdate', message)" />
        </Section>
      </Grid>
    </Stack>
  </Box>
</template>
