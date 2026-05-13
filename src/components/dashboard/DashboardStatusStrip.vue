<script setup lang="ts">
import { computed } from "vue";
import { Activity, AlertCircle, Fingerprint, RadioTower, Server } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import DashboardMenubar from "@/components/dashboard/DashboardMenubar.vue";
import { InlineGroup, Section, Text } from "@/components/layout";
import Badge from "@/components/ui/Badge.vue";
import { Separator } from "@/components/ui/separator";
import { eventStore } from "@/state/eventStore";
import { stateStore } from "@/state/stateStore";

defineProps<{
  connectionPending: boolean;
}>();

const emit = defineEmits<{
  reconnect: [];
}>();

const { t } = useI18n();

const targetCount = computed(() => stateStore.state.targets.length);
const eventCount = computed(() => eventStore.allRecords.value.length);
const failedNodeCount = computed(() => stateStore.stateCounts.value.failed ?? 0);
const identityLabel = computed(() => stateStore.state.identity?.principal ?? t("app.waitingIdentity"));

function connectionVariant(): "success" | "warning" | "danger" | "muted" {
  if (stateStore.state.connectionState === "established") {
    return "success";
  }
  if (stateStore.state.connectionState === "connecting") {
    return "warning";
  }
  if (stateStore.state.connectionState === "closed") {
    return "danger";
  }
  return "muted";
}
</script>

<template>
  <Section
    class="flex flex-col gap-3 rounded-md border bg-card/80 p-3 xl:flex-row xl:items-center xl:justify-between"
    data-testid="status-strip"
    aria-label="status strip"
  >
    <InlineGroup class="flex-col items-stretch gap-0 xl:flex-row xl:items-center">
      <InlineGroup justify="between" class="gap-3 xl:justify-start">
        <InlineGroup as="span" gap="sm" class="text-sm text-muted-foreground">
          <RadioTower class="h-4 w-4" aria-hidden="true" />
          <Text as="span" class="truncate">{{ t("statusStrip.relay") }}</Text>
        </InlineGroup>
        <Badge :variant="connectionVariant()">
          {{ t(`app.connectionState.${stateStore.state.connectionState}`) }}
        </Badge>
      </InlineGroup>
      <Separator class="my-2 xl:hidden" />
      <Separator orientation="vertical" class="mx-3 hidden h-7 xl:block" />

      <InlineGroup justify="between" class="gap-3 xl:justify-start">
        <InlineGroup as="span" gap="sm" class="text-sm text-muted-foreground">
          <Fingerprint class="h-4 w-4" aria-hidden="true" />
          <Text as="span" class="truncate">{{ t("statusStrip.identity") }}</Text>
        </InlineGroup>
        <Badge variant="outline">
          <Text as="span" class="max-w-[12rem] truncate">{{ identityLabel }}</Text>
        </Badge>
      </InlineGroup>
      <Separator class="my-2 xl:hidden" />
      <Separator orientation="vertical" class="mx-3 hidden h-7 xl:block" />

      <InlineGroup justify="between" class="gap-3 xl:justify-start">
        <InlineGroup as="span" gap="sm" class="text-sm text-muted-foreground">
          <Server class="h-4 w-4" aria-hidden="true" />
          <Text as="span" class="truncate">{{ t("statusStrip.targets") }}</Text>
        </InlineGroup>
        <Badge variant="secondary">{{ targetCount }}</Badge>
      </InlineGroup>
      <Separator class="my-2 xl:hidden" />
      <Separator orientation="vertical" class="mx-3 hidden h-7 xl:block" />

      <InlineGroup justify="between" class="gap-3 xl:justify-start">
        <InlineGroup as="span" gap="sm" class="text-sm text-muted-foreground">
          <Activity v-if="failedNodeCount === 0" class="h-4 w-4" aria-hidden="true" />
          <AlertCircle v-else class="h-4 w-4" aria-hidden="true" />
          <Text as="span" class="truncate">{{ t("statusStrip.events") }}</Text>
        </InlineGroup>
        <InlineGroup gap="sm">
          <Badge :variant="failedNodeCount > 0 ? 'danger' : 'success'">
            {{ t("statusStrip.failedNodes", { count: failedNodeCount }) }}
          </Badge>
          <Separator orientation="vertical" class="h-5" />
          <Badge variant="muted">{{ eventCount }}</Badge>
        </InlineGroup>
      </InlineGroup>
    </InlineGroup>

    <Separator class="xl:hidden" />
    <DashboardMenubar :connection-pending="connectionPending" @reconnect="emit('reconnect')" />
  </Section>
</template>
