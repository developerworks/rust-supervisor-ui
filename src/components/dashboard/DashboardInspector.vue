<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ControlPanel from "@/components/ControlPanel.vue";
import NodeDetailsPanel from "@/components/NodeDetailsPanel.vue";
import TargetList from "@/components/TargetList.vue";
import { PanelHeader } from "@/components/layout";
import Card from "@/components/ui/Card.vue";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import type { ControlCommandRequest } from "@/types/protocol";

const props = defineProps<{
  commandPending: boolean;
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  command: [request: ControlCommandRequest];
}>();

const { t } = useI18n();

const activeTab = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value)
});
</script>

<template>
  <Card padded class="min-w-0 xl:sticky xl:top-4" aria-label="inspector" data-testid="dashboard-inspector">
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.inspector')"
      :title="t('sections.inspectorTitle')"
    />

    <Tabs v-model="activeTab" class="flex min-w-0 flex-col gap-3">
      <TabsList class="grid w-full grid-cols-3 rounded-md">
        <TabsTrigger value="targets">{{ t("inspectorTabs.targets") }}</TabsTrigger>
        <TabsTrigger value="node">{{ t("inspectorTabs.node") }}</TabsTrigger>
        <TabsTrigger value="command">{{ t("inspectorTabs.command") }}</TabsTrigger>
      </TabsList>

      <TabsContent value="targets" class="mt-0">
        <TargetList />
      </TabsContent>
      <TabsContent value="node" class="mt-0">
        <NodeDetailsPanel />
      </TabsContent>
      <TabsContent value="command" class="mt-0">
        <ControlPanel
          :pending="commandPending"
          @command="(request) => emit('command', request)"
        />
      </TabsContent>
    </Tabs>
  </Card>
</template>
