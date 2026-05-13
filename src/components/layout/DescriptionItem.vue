<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  label: string;
  value?: string | number;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div :class="cn('rounded-md bg-muted p-3', props.class)">
    <dt class="muted-label">{{ label }}</dt>
    <dd class="mt-1 font-semibold">
      <slot>{{ value }}</slot>
    </dd>
  </div>
</template>
