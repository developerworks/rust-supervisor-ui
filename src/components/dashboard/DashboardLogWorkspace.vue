<script setup lang="ts">
import EventLogPanel from "@/components/EventLogPanel.vue";
import FilterBar from "@/components/FilterBar.vue";
import { Section, Stack } from "@/components/layout";
import Card from "@/components/ui/Card.vue";
import { Separator } from "@/components/ui/separator";
import type { ClientMessage } from "@/types/protocol";

const emit = defineEmits<{
  filterUpdate: [message: ClientMessage];
}>();
</script>

<template>
  <Card padded class="min-w-0" aria-label="log workspace" data-testid="dashboard-log-workspace">
    <Stack gap="lg" class="min-w-0">
      <Section class="min-w-0" data-testid="dashboard-log-filters">
        <FilterBar @filter-update="(message) => emit('filterUpdate', message)" />
      </Section>
      <Separator data-testid="dashboard-log-separator" />
      <Section class="min-w-0" data-testid="dashboard-log-events">
        <EventLogPanel @filter-update="(message) => emit('filterUpdate', message)" />
      </Section>
    </Stack>
  </Card>
</template>
