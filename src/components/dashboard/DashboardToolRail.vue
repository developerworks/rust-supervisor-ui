<script setup lang="ts">
import ControlPanel from "@/components/ControlPanel.vue";
import FilterBar from "@/components/FilterBar.vue";
import TargetList from "@/components/TargetList.vue";
import type { ClientMessage, ControlCommandRequest } from "@/types/protocol";

defineProps<{
  commandPending: boolean;
}>();

const emit = defineEmits<{
  filterUpdate: [message: ClientMessage];
  command: [request: ControlCommandRequest];
}>();
</script>

<template>
  <div class="flex min-h-0 flex-col gap-4">
    <TargetList />
    <ControlPanel :pending="commandPending" @command="(request) => emit('command', request)" />
    <FilterBar @filter-update="(message) => emit('filterUpdate', message)" />
  </div>
</template>
