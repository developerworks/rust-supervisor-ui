<script setup lang="ts">
import { useI18n } from "vue-i18n";
import EventLogPanel from "@/components/EventLogPanel.vue";
import FilterBar from "@/components/FilterBar.vue";
import { Grid, PanelHeader, Section } from "@/components/layout";
import Card from "@/components/ui/Card.vue";
import { Separator } from "@/components/ui/separator";
import type { ClientMessage } from "@/types/protocol";

const emit = defineEmits<{
  filterUpdate: [message: ClientMessage];
}>();

const { t } = useI18n();
</script>

<template>
  <Card padded class="min-w-0" aria-label="log workspace" data-testid="dashboard-log-workspace">
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.logWorkspace')"
      :title="t('sections.logWorkspaceTitle')"
    />

    <Grid class="min-w-0 gap-4 lg:grid-cols-[minmax(18rem,24rem)_auto_minmax(0,1fr)]">
      <Section class="min-w-0" data-testid="dashboard-log-filters">
        <FilterBar @filter-update="(message) => emit('filterUpdate', message)" />
      </Section>
      <Separator class="lg:hidden" data-testid="dashboard-log-separator-mobile" />
      <Separator orientation="vertical" class="hidden h-full lg:block" data-testid="dashboard-log-separator-desktop" />
      <Section class="min-w-0" data-testid="dashboard-log-events">
        <EventLogPanel @filter-update="(message) => emit('filterUpdate', message)" />
      </Section>
    </Grid>
  </Card>
</template>
