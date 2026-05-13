<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { PanelHeader } from "@/components/layout";
import Card from "@/components/ui/Card.vue";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import DiagnosticsPanel from "@/components/dashboard/DiagnosticsPanel.vue";
import RuntimeStatePanel from "@/components/dashboard/RuntimeStatePanel.vue";
import type { ControlCommandResult } from "@/types/protocol";

const props = defineProps<{
  lastCommandResult: ControlCommandResult | null;
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const { t } = useI18n();

const activeTab = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value)
});
</script>

<template>
  <Card padded class="min-w-0" aria-label="runtime detail" data-testid="dashboard-bottom-panel">
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.bottomPanel')"
      :title="t('sections.bottomTitle')"
    />

    <Tabs v-model="activeTab" class="flex min-w-0 flex-col gap-3">
      <TabsList class="grid w-full grid-cols-2 rounded-md lg:w-[20rem]">
        <TabsTrigger value="runtime">{{ t("bottomTabs.runtime") }}</TabsTrigger>
        <TabsTrigger value="diagnostics">{{ t("bottomTabs.diagnostics") }}</TabsTrigger>
      </TabsList>
      <TabsContent value="runtime" class="mt-0">
        <RuntimeStatePanel />
      </TabsContent>
      <TabsContent value="diagnostics" class="mt-0">
        <DiagnosticsPanel :last-command-result="lastCommandResult" />
      </TabsContent>
    </Tabs>
  </Card>
</template>
