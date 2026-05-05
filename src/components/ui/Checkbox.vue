<script setup lang="ts">
import { Check } from "lucide-vue-next";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    ariaLabel: string;
  }>(),
  {
    modelValue: false
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-label="props.ariaLabel"
    :aria-checked="props.modelValue"
    :class="cn('inline-flex h-5 w-5 items-center justify-center rounded border border-input bg-card text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')"
    @click="emit('update:modelValue', !props.modelValue)"
  >
    <Check v-if="props.modelValue" class="h-3.5 w-3.5" aria-hidden="true" />
  </button>
</template>
