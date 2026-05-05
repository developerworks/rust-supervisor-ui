<script setup lang="ts">
import { computed, ref } from "vue";
import { Play, ShieldCheck } from "lucide-vue-next";
import Button from "@/components/ui/Button.vue";
import Card from "@/components/ui/Card.vue";
import Label from "@/components/ui/Label.vue";
import Select from "@/components/ui/Select.vue";
import Textarea from "@/components/ui/Textarea.vue";
import ConfirmCommandDialog from "@/components/ConfirmCommandDialog.vue";
import { snapshotStore } from "@/state/snapshotStore";
import type { ControlCommandName, ControlCommandRequest } from "@/types/protocol";
import { createCommandId, isDangerousCommandName } from "@/types/protocol";

const emit = defineEmits<{
  command: [request: ControlCommandRequest];
}>();

const command = ref<ControlCommandName>("pause_child");
const reason = ref("");
const localError = ref("");
const confirmOpen = ref(false);

const selectedTarget = computed(() => snapshotStore.selectedTarget.value);
const selectedNode = computed(() => snapshotStore.selectedNode.value);
const controlReady = computed(
  () =>
    snapshotStore.state.controlSessionEstablished &&
    selectedTarget.value?.connection_state === "connected" &&
    Boolean(selectedTarget.value)
);

const commandOptions = [
  { value: "restart_child", label: "restart child(重启子任务)" },
  { value: "pause_child", label: "pause child(暂停子任务)" },
  { value: "resume_child", label: "resume child(恢复子任务)" },
  { value: "quarantine_child", label: "quarantine child(隔离子任务)" },
  { value: "remove_child", label: "remove child(移除子任务)" },
  { value: "add_child", label: "add child(添加子任务)" },
  { value: "shutdown_tree", label: "shutdown tree(关闭监督树)" }
];

function submit(): void {
  localError.value = "";
  if (!reason.value.trim()) {
    localError.value = "reason(原因) 必填.";
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
        <p class="muted-label">control panel(控制面板)</p>
        <h2 class="panel-title">监督命令</h2>
      </div>
      <ShieldCheck class="h-5 w-5 text-slate-500" aria-hidden="true" />
    </div>

    <form class="space-y-3" @submit.prevent="submit">
      <div class="grid gap-3 md:grid-cols-2">
        <div class="space-y-1.5">
          <Label for="command-select">command(命令)</Label>
          <Select id="command-select" v-model="command" ariaLabel="command select" :options="commandOptions" :disabled="!controlReady" />
        </div>
        <div class="space-y-1.5">
          <Label>target(目标)</Label>
          <div class="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-slate-700">
            {{ selectedNode?.path ?? "未选择节点" }}
          </div>
        </div>
      </div>

      <div class="space-y-1.5">
        <Label for="command-reason">reason(原因)</Label>
        <Textarea id="command-reason" v-model="reason" aria-label="command reason" placeholder="说明本次控制命令原因" />
      </div>

      <p v-if="!controlReady" class="rounded-md border border-amber-200 bg-amber-50 p-2 text-sm text-amber-800">
        需要 connected(已连接) 目标和已建立 control session(控制会话).
      </p>
      <p v-if="localError" class="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
        {{ localError }}
      </p>

      <Button type="submit" class="w-full" :disabled="!controlReady">
        <Play class="h-4 w-4" aria-hidden="true" />
        提交命令
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
