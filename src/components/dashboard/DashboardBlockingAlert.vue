<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { AlertTriangle, ChevronDown, ChevronUp, Clipboard, GripHorizontal, ListChecks } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { toast } from "vue-sonner";
import { Box, InlineGroup, Stack, Text } from "@/components/layout";
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
const isExpanded = ref(false);
const invalidRelayDiagnostic = computed(() =>
  stateStore.state.diagnostics.find((diagnostic) => diagnostic.code === "invalid_relay_url") ?? null
);

watch(invalidRelayDiagnostic, (diagnostic) => {
  if (!diagnostic) {
    isExpanded.value = false;
  }
});

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
  <Stack
    v-if="invalidRelayDiagnostic"
    gap="none"
    class="min-w-0"
    :aria-label="t('blockingAlert.drawerLabel')"
    data-testid="blocking-alert-drawer"
  >
    <InlineGroup justify="center" class="min-w-0">
      <Button
        type="button"
        variant="outline"
        size="sm"
        class="border-destructive/40 bg-card shadow-sm"
        :aria-expanded="isExpanded"
        aria-controls="blocking-alert-panel"
        data-testid="blocking-alert-handle"
        @click="isExpanded = !isExpanded"
      >
        <GripHorizontal aria-hidden="true" />
        <Text as="span" variant="strong" class="text-xs">
          {{ t("blockingAlert.invalidRelayTitle") }}
        </Text>
        <Text as="span" variant="small">
          {{ isExpanded ? t("blockingAlert.collapse") : t("blockingAlert.expand") }}
        </Text>
        <ChevronUp v-if="isExpanded" aria-hidden="true" />
        <ChevronDown v-else aria-hidden="true" />
      </Button>
    </InlineGroup>

    <Transition
      enter-active-class="overflow-hidden transition-all duration-200 ease-out"
      enter-from-class="-translate-y-2 opacity-0 max-h-0"
      enter-to-class="translate-y-0 opacity-100 max-h-96"
      leave-active-class="overflow-hidden transition-all duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100 max-h-96"
      leave-to-class="-translate-y-2 opacity-0 max-h-0"
    >
      <Box
        v-show="isExpanded"
        id="blocking-alert-panel"
        class="min-w-0 pt-2"
        data-testid="blocking-alert-panel"
      >
        <Alert
          variant="destructive"
          data-testid="blocking-alert"
          class="rounded-md bg-card shadow-sm"
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
      </Box>
    </Transition>
  </Stack>
</template>
