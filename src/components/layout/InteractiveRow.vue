<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    selected?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    selected: false,
    disabled: false,
    type: "button"
  }
);

defineEmits<{
  click: [event: MouseEvent];
}>();

const classes = computed(() =>
  cn(
    "w-full rounded-md border p-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    props.selected ? "border-primary bg-secondary" : "border-border bg-card",
    props.class
  )
);
</script>

<template>
  <button :type="props.type" :disabled="props.disabled" :class="classes" @click="$emit('click', $event)">
    <slot />
  </button>
</template>
