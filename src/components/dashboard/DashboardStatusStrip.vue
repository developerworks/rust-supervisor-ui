<script setup lang="ts">
import { computed } from "vue";
import { Activity, AlertCircle, Fingerprint, Github, RadioTower, Server } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import DashboardMenubar from "@/components/dashboard/DashboardMenubar.vue";
import { Box, InlineGroup, Section, Text } from "@/components/layout";
import Badge from "@/components/ui/Badge.vue";
import { Button } from "@/components/ui/button";
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
const repositoryUrl = "https://github.com/developerworks/rust-supervisor-ui";

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
    class="flex flex-col gap-3 rounded-md border bg-card/80 p-3"
    data-testid="status-strip"
    aria-label="status strip"
  >
    <InlineGroup justify="between" class="flex-col items-stretch gap-3 xl:flex-row xl:items-center">
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

      <InlineGroup justify="end" class="gap-2">
        <Button
          as="a"
          variant="ghost"
          size="icon-sm"
          :href="repositoryUrl"
          target="_blank"
          rel="noreferrer noopener"
          :aria-label="t('menu.repository')"
          data-testid="repository-link"
        >
          <Github aria-hidden="true" />
        </Button>
        <DashboardMenubar :connection-pending="connectionPending" @reconnect="emit('reconnect')" />
      </InlineGroup>
    </InlineGroup>

    <Box
      class="w-full min-w-0 rounded-md border border-border bg-muted/40 p-2"
      data-testid="identity-status"
    >
      <InlineGroup align="start" class="w-full min-w-0 flex-col gap-2 xl:flex-row">
        <InlineGroup as="span" gap="sm" class="shrink-0 text-sm text-muted-foreground">
          <Fingerprint class="h-4 w-4" aria-hidden="true" />
          <Text as="span">{{ t("statusStrip.identity") }}</Text>
        </InlineGroup>
        <Badge variant="outline" class="w-full min-w-0 justify-start">
          <Text
            as="span"
            class="block w-full break-all font-mono text-left leading-snug"
            data-testid="identity-status-value"
          >
            {{ identityLabel }}
          </Text>
        </Badge>
      </InlineGroup>
    </Box>
  </Section>
</template>
