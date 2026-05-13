<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import TopologyCanvas from "@/components/TopologyCanvas.vue";
import DiagnosticsPanel from "@/components/dashboard/DiagnosticsPanel.vue";
import DashboardStatusRail from "@/components/dashboard/DashboardStatusRail.vue";
import DashboardToolRail from "@/components/dashboard/DashboardToolRail.vue";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { preferenceState } from "@/state/preferenceStore";
import type { ClientMessage, ControlCommandRequest, ControlCommandResult } from "@/types/protocol";

defineProps<{
  lastCommandResult: ControlCommandResult | null;
  commandPending: boolean;
}>();

const emit = defineEmits<{
  filterUpdate: [message: ClientMessage];
  command: [request: ControlCommandRequest];
}>();

const { t } = useI18n();
const isDesktop = useMediaQuery("(min-width: 1280px)");
</script>

<template>
  <div
    class="w-full max-w-none px-4 py-4"
    data-testid="dashboard-layout"
  >
    <div
      v-if="preferenceState.layoutMode === 'standard'"
      data-testid="dashboard-standard-layout"
    >
      <div
        v-if="isDesktop"
        class="grid min-h-[calc(100svh-6.5rem)] grid-cols-[minmax(18rem,23rem)_minmax(0,1fr)_minmax(19rem,24rem)] items-start gap-4 bg-background p-4"
      >
        <DashboardStatusRail />

        <section class="flex min-w-0 flex-col gap-4" data-testid="dashboard-main-content">
          <TopologyCanvas />
          <DiagnosticsPanel :last-command-result="lastCommandResult" />
        </section>

        <aside class="min-w-0" data-testid="dashboard-right-rail">
          <DashboardToolRail
            :command-pending="commandPending"
            @filter-update="(message) => emit('filterUpdate', message)"
            @command="(request) => emit('command', request)"
          />
        </aside>
      </div>

      <div v-else class="grid items-start gap-4">
        <section class="flex min-w-0 flex-col gap-4" data-testid="dashboard-main-content">
          <TopologyCanvas />
          <DiagnosticsPanel :last-command-result="lastCommandResult" />
        </section>

        <DashboardStatusRail />

        <aside data-testid="dashboard-right-rail">
          <DashboardToolRail
            :command-pending="commandPending"
            @filter-update="(message) => emit('filterUpdate', message)"
            @command="(request) => emit('command', request)"
          />
        </aside>
      </div>
    </div>

    <SidebarProvider
      v-else
      class="min-h-[calc(100svh-6.5rem)] bg-background max-xl:flex-col"
      data-testid="dashboard-sidebar-layout"
    >
      <SidebarInset class="min-h-0 overflow-hidden">
        <div
          v-if="isDesktop"
          class="grid h-full min-w-0 grid-cols-[minmax(18rem,23rem)_minmax(0,1fr)] items-start gap-4 overflow-auto p-4"
        >
          <DashboardStatusRail />
          <section class="flex min-w-0 flex-col gap-4" data-testid="dashboard-main-content">
            <TopologyCanvas />
            <DiagnosticsPanel :last-command-result="lastCommandResult" />
          </section>
        </div>

        <div v-else class="grid min-w-0 items-start gap-4 overflow-auto p-4">
          <section class="flex min-w-0 flex-col gap-4" data-testid="dashboard-main-content">
            <TopologyCanvas />
            <DiagnosticsPanel :last-command-result="lastCommandResult" />
          </section>
          <DashboardStatusRail />
        </div>
      </SidebarInset>

      <Sidebar collapsible="none" class="max-xl:w-full xl:w-[--sidebar-width]">
        <SidebarHeader>
          <div class="px-2 py-1 text-sm font-semibold">{{ t("layout.sidebar07") }}</div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{{ t("layout.tools") }}</SidebarGroupLabel>
            <SidebarGroupContent>
              <DashboardToolRail
                :command-pending="commandPending"
                @filter-update="(message) => emit('filterUpdate', message)"
                @command="(request) => emit('command', request)"
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  </div>
</template>
