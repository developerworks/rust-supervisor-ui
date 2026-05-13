<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { AlertTriangle } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import Button from "@/components/ui/Button.vue";
import Checkbox from "@/components/ui/Checkbox.vue";
import Label from "@/components/ui/Label.vue";
import Textarea from "@/components/ui/Textarea.vue";
import type { ControlCommandName } from "@/types/protocol";

const props = withDefaults(
  defineProps<{
    open: boolean;
    command: ControlCommandName;
    targetPath: string;
    reason: string;
  }>(),
  {
    open: false,
    targetPath: "/root",
    reason: ""
  }
);

const emit = defineEmits<{
  close: [];
  confirm: [payload: { reason: string; confirmed: boolean }];
}>();

const { t } = useI18n();
const localReason = ref(props.reason);
const confirmed = ref(false);
const error = ref("");
const commandLabel = computed(() => t(`control.commands.${props.command}`));

watch(
  () => props.open,
  (open) => {
    if (open) {
      localReason.value = props.reason;
      confirmed.value = false;
      error.value = "";
    }
  }
);

const canSubmit = computed(() => localReason.value.trim().length > 0 && confirmed.value);

function submit(): void {
  if (!localReason.value.trim()) {
    error.value = t("control.reasonRequired");
    return;
  }
  if (!confirmed.value) {
    error.value = t("confirmCommand.missingConfirmation");
    return;
  }
  emit("confirm", {
    reason: localReason.value,
    confirmed: true
  });
}
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="presentation">
      <section
        class="w-full max-w-lg rounded-lg border bg-card p-5 shadow-panel"
        role="dialog"
        aria-modal="true"
        aria-label="confirm command"
      >
        <div class="flex items-start gap-3">
          <div class="rounded-md bg-red-50 p-2 text-red-700 dark:bg-red-950 dark:text-red-200">
            <AlertTriangle class="h-5 w-5" aria-hidden="true" />
          </div>
          <div class="min-w-0">
            <h2 class="text-base font-semibold leading-6 text-foreground">{{ t("confirmCommand.title") }}</h2>
            <p class="mt-1 text-sm leading-5 text-muted-foreground">
              {{ t("confirmCommand.description", { command: commandLabel, targetPath: props.targetPath }) }}
            </p>
          </div>
        </div>

        <div class="mt-4 flex flex-col gap-2">
          <Label for="confirm-reason">{{ t("control.reason") }}</Label>
          <Textarea id="confirm-reason" v-model="localReason" aria-label="confirm reason" :placeholder="t('confirmCommand.reasonPlaceholder')" />
        </div>

        <div class="mt-4 flex items-center gap-3">
          <Checkbox v-model="confirmed" ariaLabel="danger confirmation" />
          <span class="text-sm text-foreground">{{ t("confirmCommand.confirmation") }}</span>
        </div>

        <p v-if="error" class="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {{ error }}
        </p>

        <div class="mt-5 flex justify-end gap-2">
          <Button variant="outline" @click="emit('close')">{{ t("common.cancel") }}</Button>
          <Button variant="destructive" :disabled="!canSubmit" @click="submit">{{ t("common.confirmSubmit") }}</Button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
