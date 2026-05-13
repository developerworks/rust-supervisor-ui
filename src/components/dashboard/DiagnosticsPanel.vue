<script setup lang="ts">
import { AlertCircle } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import Card from "@/components/ui/Card.vue";
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
  <Card aria-label="diagnostics">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="muted-label">{{ t("sections.diagnostics") }}</p>
        <h2 class="panel-title">{{ t("sections.diagnosticsTitle") }}</h2>
      </div>
      <AlertCircle class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </div>

    <p v-if="props.lastCommandResult" class="mb-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
      {{ t("diagnostics.commandResult", { result: `${props.lastCommandResult.command_id} ${protocolLabels.commandStatus(props.lastCommandResult.status)}` }) }}
    </p>

    <div v-if="stateStore.state.diagnostics.length === 0" class="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
      {{ t("diagnostics.empty") }}
    </div>
    <ul v-else class="flex flex-col gap-2" data-testid="diagnostics">
      <li
        v-for="error in stateStore.state.diagnostics"
        :key="`${error.code}:${error.message}`"
        class="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
      >
        <p class="font-semibold">{{ error.code }}</p>
        <p class="mt-1 leading-5">{{ error.message }}</p>
      </li>
    </ul>
  </Card>
</template>
