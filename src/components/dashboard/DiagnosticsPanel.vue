<script setup lang="ts">
import { AlertCircle } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { List, ListItem, PanelHeader, Section, Text } from "@/components/layout";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
import { useProtocolLabels } from "@/i18n/protocolLabels";
import { stateStore } from "@/state/stateStore";
import type { ControlCommandResult } from "@/types/protocol";

const props = defineProps<{
  lastCommandResult: ControlCommandResult | null;
}>();

const { t } = useI18n();
const protocolLabels = useProtocolLabels();
</script>

<template>
  <Section aria-label="diagnostics" data-testid="diagnostics-panel">
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.diagnostics')"
      :title="t('sections.diagnosticsTitle')"
    >
      <AlertCircle class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </PanelHeader>

    <Text v-if="props.lastCommandResult" class="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
      {{ t("diagnostics.commandResult", { result: `${props.lastCommandResult.command_id} ${protocolLabels.commandStatus(props.lastCommandResult.status)}` }) }}
    </Text>

    <Empty v-if="stateStore.state.diagnostics.length === 0" class="min-h-48 rounded-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{{ t("diagnostics.emptyTitle") }}</EmptyTitle>
        <EmptyDescription>{{ t("diagnostics.emptyDescription") }}</EmptyDescription>
      </EmptyHeader>
    </Empty>
    <List v-else class="flex flex-col gap-2" data-testid="diagnostics">
      <ListItem
        v-for="error in stateStore.state.diagnostics"
        :key="`${error.code}:${error.message}`"
        class="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
      >
        <Text class="font-semibold">{{ error.code }}</Text>
        <Text class="mt-1 leading-5">{{ error.message }}</Text>
      </ListItem>
    </List>
  </Section>
</template>
