<script setup lang="ts">
import EventLogPanel from "@/components/EventLogPanel.vue";
import NodeDetailsPanel from "@/components/NodeDetailsPanel.vue";
</script>

<template>
  <aside class="flex min-w-0 flex-col gap-4" data-testid="dashboard-left-rail">
    <EventLogPanel />
    <NodeDetailsPanel />
  </aside>
</template>
