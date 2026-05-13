<script setup lang="ts">
import { computed } from "vue";
import { AlertTriangle, Clipboard, ListChecks } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";
import { InlineGroup, Stack, Text } from "@/components/layout";
import Button from "@/components/ui/Button.vue";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { stateStore } from "@/state/stateStore";

const emit = defineEmits<{
  showDiagnostics: [];
}>();

const { t } = useI18n();
const invalidRelayDiagnostic = computed(() =>
  stateStore.state.diagnostics.find((diagnostic) => diagnostic.code === "invalid_relay_url") ?? null
);

async function copyEnvironmentName(): Promise<void> {
  try {
    await navigator.clipboard.writeText("VITE_SUPERVISOR_RELAY_URL");
    toast.success(t("blockingAlert.copied"));
  } catch {
    toast.error(t("blockingAlert.copyFailed"));
  }
}
</script>

<template>
  <Alert
    v-if="invalidRelayDiagnostic"
    variant="destructive"
    data-testid="blocking-alert"
    class="rounded-md bg-card"
  >
    <AlertTriangle aria-hidden="true" />
    <AlertTitle>{{ t("blockingAlert.invalidRelayTitle") }}</AlertTitle>
    <AlertDescription>
      <Stack gap="md">
        <Text>
          {{ t("blockingAlert.invalidRelayDescription") }}
        </Text>
        <Text class="text-xs text-muted-foreground">
          {{ invalidRelayDiagnostic.message }}
        </Text>
        <InlineGroup wrap gap="sm">
          <Button type="button" variant="outline" size="sm" @click="copyEnvironmentName">
            <Clipboard aria-hidden="true" />
            {{ t("blockingAlert.copyEnvironment") }}
          </Button>
          <Button type="button" variant="outline" size="sm" @click="emit('showDiagnostics')">
            <ListChecks aria-hidden="true" />
            {{ t("blockingAlert.showDiagnostics") }}
          </Button>
        </InlineGroup>
      </Stack>
    </AlertDescription>
  </Alert>
</template>
