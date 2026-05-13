<script setup lang="ts">
import { computed, ref } from "vue";
import { Play, ShieldCheck } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import Button from "@/components/ui/Button.vue";
import Card from "@/components/ui/Card.vue";
import Label from "@/components/ui/Label.vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import Textarea from "@/components/ui/Textarea.vue";
import ConfirmCommandDialog from "@/components/ConfirmCommandDialog.vue";
import { stateStore } from "@/state/stateStore";
import type { ControlCommandName, ControlCommandRequest } from "@/types/protocol";
import { createCommandId, isDangerousCommandName } from "@/types/protocol";

const emit = defineEmits<{
  command: [request: ControlCommandRequest];
}>();

const props = withDefaults(
  defineProps<{
    pending?: boolean;
  }>(),
  {
    pending: false
  }
);

const { t } = useI18n();
const command = ref<ControlCommandName>("pause_child");
const reason = ref("");
const localError = ref("");
const confirmOpen = ref(false);

const selectedTarget = computed(() => stateStore.selectedTarget.value);
const selectedNode = computed(() => stateStore.selectedNode.value);
const controlReady = computed(
  () =>
    stateStore.state.controlSessionEstablished &&
    selectedTarget.value?.connection_state === "connected" &&
    Boolean(selectedTarget.value)
);

const commandOptions = computed(() => [
  { value: "restart_child", label: t("control.commands.restart_child") },
  { value: "pause_child", label: t("control.commands.pause_child") },
  { value: "resume_child", label: t("control.commands.resume_child") },
  { value: "quarantine_child", label: t("control.commands.quarantine_child") },
  { value: "remove_child", label: t("control.commands.remove_child") },
  { value: "add_child", label: t("control.commands.add_child") },
  { value: "shutdown_tree", label: t("control.commands.shutdown_tree") }
] satisfies Array<{ value: ControlCommandName; label: string }>);

const selectedCommandLabel = computed(
  () => commandOptions.value.find((option) => option.value === command.value)?.label ?? t("control.selectCommand")
);

function submit(): void {
  localError.value = "";
  if (!reason.value.trim()) {
    localError.value = t("control.reasonRequired");
    return;
  }
  if (isDangerousCommandName(command.value)) {
    confirmOpen.value = true;
    return;
  }
  emit("command", buildRequest(false, reason.value));
}

function confirmDangerous(payload: { reason: string; confirmed: boolean }): void {
  confirmOpen.value = false;
  reason.value = payload.reason;
  emit("command", buildRequest(payload.confirmed, payload.reason));
}

function buildRequest(confirmed: boolean, nextReason: string): ControlCommandRequest {
  const targetId = selectedTarget.value?.target_id ?? "";
  const childPath = selectedNode.value?.path;
  return {
    type: "command",
    command_id: createCommandId(),
    target_id: targetId,
    command: command.value,
    target: command.value === "shutdown_tree" ? {} : { child_path: childPath ?? "/root" },
    reason: nextReason,
    confirmed
  };
}
</script>

<template>
  <Card aria-label="control panel">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="muted-label">{{ t("sections.controlPanel") }}</p>
        <h2 class="panel-title">{{ t("sections.controlTitle") }}</h2>
      </div>
      <ShieldCheck class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </div>

    <form class="flex flex-col gap-3" @submit.prevent="submit">
      <div class="grid gap-3">
        <div class="flex min-w-0 flex-col gap-1.5">
          <Label for="command-select">{{ t("control.command") }}</Label>
          <Select v-model="command" :disabled="!controlReady || props.pending">
            <SelectTrigger id="command-select" aria-label="command select">
              <span class="truncate">{{ selectedCommandLabel }}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="option in commandOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="flex min-w-0 flex-col gap-1.5">
          <Label>{{ t("control.target") }}</Label>
          <div
            class="flex h-9 min-w-0 items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-md border bg-muted px-3 text-sm text-foreground"
            data-testid="command-target-path"
          >
            {{ selectedNode?.path ?? t("control.noNode") }}
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <Label for="command-reason">{{ t("control.reason") }}</Label>
        <Textarea id="command-reason" v-model="reason" aria-label="command reason" :placeholder="t('control.reasonPlaceholder')" />
      </div>

      <p v-if="!controlReady" class="rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        {{ t("control.notReady") }}
      </p>
      <p v-if="localError" class="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        {{ localError }}
      </p>

      <Button type="submit" class="w-full" :disabled="!controlReady || props.pending">
        <Spinner v-if="props.pending" aria-hidden="true" />
        <Play v-else class="h-4 w-4" aria-hidden="true" />
        {{ props.pending ? t("control.submitting") : t("control.submit") }}
      </Button>
    </form>

    <ConfirmCommandDialog
      :open="confirmOpen"
      :command="command"
      :target-path="selectedNode?.path ?? '/root'"
      :reason="reason"
      @close="confirmOpen = false"
      @confirm="confirmDangerous"
    />
  </Card>
</template>
