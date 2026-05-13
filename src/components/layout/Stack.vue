<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    as?: string;
    class?: HTMLAttributes["class"];
    gap?: "none" | "xs" | "sm" | "md" | "lg";
  }>(),
  {
    as: "div",
    gap: "md"
  }
);

const classes = computed(() =>
  cn(
    "flex min-w-0 flex-col",
    props.gap === "xs" && "gap-1.5",
    props.gap === "sm" && "gap-2",
    props.gap === "md" && "gap-3",
    props.gap === "lg" && "gap-4",
    props.class
  )
);
</script>

<template>
  <component :is="props.as" :class="classes">
    <slot />
  </component>
</template>
