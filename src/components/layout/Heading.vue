<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    level?: "1" | "2" | "3";
    variant?: "page" | "panel" | "subtle";
    class?: HTMLAttributes["class"];
  }>(),
  {
    level: "2",
    variant: "panel"
  }
);

const tag = computed(() => `h${props.level}`);
const classes = computed(() =>
  cn(
    props.variant === "page" && "text-xl font-semibold leading-7 tracking-normal text-foreground",
    props.variant === "panel" && "panel-title",
    props.variant === "subtle" && "text-base font-semibold leading-6 text-foreground",
    props.class
  )
);
</script>

<template>
  <component :is="tag" :class="classes">
    <slot />
  </component>
</template>
