<script setup lang="ts">
import { useI18n } from "vue-i18n";
import ControlPanel from "@/components/ControlPanel.vue";
import NodeDetailsPanel from "@/components/NodeDetailsPanel.vue";
import TargetList from "@/components/TargetList.vue";
import DiagnosticsPanel from "@/components/dashboard/DiagnosticsPanel.vue";
import RuntimeStatePanel from "@/components/dashboard/RuntimeStatePanel.vue";
import { Box, PanelHeader, Stack } from "@/components/layout";
import Card from "@/components/ui/Card.vue";
import type { ControlCommandRequest, ControlCommandResult } from "@/types/protocol";

defineProps<{
  commandPending: boolean;
  lastCommandResult: ControlCommandResult | null;
}>();

const emit = defineEmits<{
  command: [request: ControlCommandRequest];
}>();

const { t } = useI18n();
</script>

<template>
  <Card padded class="min-w-0 xl:sticky xl:top-4" aria-label="inspector" data-testid="dashboard-inspector">
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.inspector')"
      :title="t('sections.inspectorTitle')"
    />

    <Stack gap="none" class="min-w-0 divide-y divide-border">
      <Box class="pb-4">
        <TargetList />
      </Box>
      <Box class="py-4">
        <NodeDetailsPanel />
      </Box>
      <Box class="py-4">
        <ControlPanel
          :pending="commandPending"
          @command="(request) => emit('command', request)"
        />
      </Box>
      <Box class="py-4">
        <RuntimeStatePanel />
      </Box>
      <Box class="pt-4">
        <DiagnosticsPanel id="dashboard-diagnostics-panel" :last-command-result="lastCommandResult" />
      </Box>
    </Stack>
  </Card>
</template>
