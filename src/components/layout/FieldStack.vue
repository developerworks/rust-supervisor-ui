<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import Stack from "@/components/layout/Stack.vue";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <Stack gap="xs" :class="props.class">
    <slot />
  </Stack>
</template>
