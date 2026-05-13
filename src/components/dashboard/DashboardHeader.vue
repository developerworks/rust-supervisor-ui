<script setup lang="ts">
import { LockKeyhole, RadioTower } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import DashboardMenubar from "@/components/dashboard/DashboardMenubar.vue";
import Badge from "@/components/ui/Badge.vue";
import { stateStore } from "@/state/stateStore";

defineProps<{
  connectionLabel: string;
  connectionPending: boolean;
}>();

const emit = defineEmits<{
  reconnect: [];
}>();

const { t } = useI18n();
</script>

<template>
  <header class="border-b bg-card/90 backdrop-blur">
    <div class="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="min-w-0">
        <h1 class="text-xl font-semibold leading-7 tracking-normal text-foreground">
          {{ t("app.title") }}
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ t("app.description", { connectionLabel }) }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <DashboardMenubar :connection-pending="connectionPending" @reconnect="emit('reconnect')" />
        <Badge variant="success">
          <LockKeyhole class="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          {{ stateStore.state.identity?.principal ?? t("app.waitingIdentity") }}
        </Badge>
        <Badge variant="outline">
          <RadioTower class="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          {{ t(`app.connectionState.${stateStore.state.connectionState}`) }}
        </Badge>
      </div>
    </div>
  </header>
</template>
