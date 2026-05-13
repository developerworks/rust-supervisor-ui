<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    as?: string;
    class?: HTMLAttributes["class"];
  }>(),
  {
    as: "section"
  }
);

const classes = computed(() => cn(props.class));
</script>

<template>
  <component :is="props.as" :class="classes">
    <slot />
  </component>
</template>
