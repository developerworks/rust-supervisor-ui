<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: "body" | "muted" | "muted-label" | "strong" | "small" | "danger" | "warning";
    class?: HTMLAttributes["class"];
  }>(),
  {
    as: "p",
    variant: "body"
  }
);

const classes = computed(() =>
  cn(
    props.variant === "body" && "text-sm text-foreground",
    props.variant === "muted" && "text-sm text-muted-foreground",
    props.variant === "muted-label" && "muted-label",
    props.variant === "strong" && "font-semibold text-foreground",
    props.variant === "small" && "text-xs text-muted-foreground",
    props.variant === "danger" && "text-sm text-red-700 dark:text-red-200",
    props.variant === "warning" && "text-sm text-amber-950 dark:text-amber-100",
    props.class
  )
);
</script>

<template>
  <component :is="props.as" :class="classes">
    <slot />
  </component>
</template>
