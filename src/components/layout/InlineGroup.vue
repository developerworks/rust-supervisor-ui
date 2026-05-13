<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    as?: string;
    class?: HTMLAttributes["class"];
    gap?: "none" | "xs" | "sm" | "md" | "lg";
    align?: "start" | "center" | "end";
    justify?: "start" | "between" | "end" | "center";
    wrap?: boolean;
  }>(),
  {
    as: "div",
    gap: "md",
    align: "center",
    justify: "start",
    wrap: false
  }
);

const classes = computed(() =>
  cn(
    "flex min-w-0",
    props.wrap && "flex-wrap",
    props.align === "start" && "items-start",
    props.align === "center" && "items-center",
    props.align === "end" && "items-end",
    props.justify === "start" && "justify-start",
    props.justify === "between" && "justify-between",
    props.justify === "end" && "justify-end",
    props.justify === "center" && "justify-center",
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
