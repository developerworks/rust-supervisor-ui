<script setup lang="ts">
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    padded?: boolean;
  }>(),
  {
    padded: true
  }
);
</script>

<template>
  <section :class="cn('panel', props.padded ? 'p-4' : '')">
    <slot />
  </section>
</template>
