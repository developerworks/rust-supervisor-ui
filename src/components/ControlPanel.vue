<script setup lang="ts">
import { computed, ref } from "vue";
import { MousePointerClick, Play, ShieldCheck, ShieldOff } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { Box, FieldStack, FormRoot, Grid, PanelHeader, Section, Text } from "@/components/layout";
import Button from "@/components/ui/Button.vue";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty";
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
const targetReady = computed(
  () =>
    stateStore.state.controlSessionEstablished &&
    selectedTarget.value?.connection_state === "connected" &&
    Boolean(selectedTarget.value)
);
const controlReady = computed(() => targetReady.value && Boolean(selectedNode.value));

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
  <Section aria-label="control panel">
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.controlPanel')"
      :title="t('sections.controlTitle')"
    >
      <ShieldCheck class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </PanelHeader>

    <Empty v-if="!targetReady" class="min-h-48 rounded-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldOff aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{{ t("control.unavailableTitle") }}</EmptyTitle>
        <EmptyDescription>{{ t("control.unavailableDescription") }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <Empty v-else-if="!selectedNode" class="min-h-48 rounded-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MousePointerClick aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{{ t("control.chooseNodeTitle") }}</EmptyTitle>
        <EmptyDescription>{{ t("control.chooseNodeDescription") }}</EmptyDescription>
      </EmptyHeader>
    </Empty>

    <FormRoot v-else class="flex flex-col gap-3" @submit="submit">
      <Grid class="gap-3">
        <FieldStack>
          <Label for="command-select">{{ t("control.command") }}</Label>
          <Select v-model="command" :disabled="props.pending">
            <SelectTrigger id="command-select" aria-label="command select">
              <Text as="span" class="truncate">{{ selectedCommandLabel }}</Text>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="option in commandOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </FieldStack>
        <FieldStack>
          <Label>{{ t("control.target") }}</Label>
          <Box
            class="flex h-9 min-w-0 items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-md border bg-muted px-3 text-sm text-foreground"
            data-testid="command-target-path"
          >
            {{ selectedNode?.path ?? t("control.noNode") }}
          </Box>
        </FieldStack>
      </Grid>

      <FieldStack>
        <Label for="command-reason">{{ t("control.reason") }}</Label>
        <Textarea id="command-reason" v-model="reason" aria-label="command reason" :placeholder="t('control.reasonPlaceholder')" />
      </FieldStack>

      <Text v-if="localError" class="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        {{ localError }}
      </Text>

      <Button type="submit" class="w-full" :disabled="!controlReady || props.pending">
        <Spinner v-if="props.pending" aria-hidden="true" />
        <Play v-else aria-hidden="true" />
        {{ props.pending ? t("control.submitting") : t("control.submit") }}
      </Button>
    </FormRoot>

    <ConfirmCommandDialog
      :open="confirmOpen"
      :command="command"
      :target-path="selectedNode?.path ?? '/root'"
      :reason="reason"
      @close="confirmOpen = false"
      @confirm="confirmDangerous"
    />
  </Section>
</template>
