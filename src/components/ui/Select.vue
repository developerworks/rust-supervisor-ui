<script setup lang="ts">
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    options: SelectOption[];
    ariaLabel: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: "",
    disabled: false
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <select
    :value="props.modelValue"
    :aria-label="props.ariaLabel"
    :disabled="props.disabled"
    :class="cn('h-9 w-full rounded-md border border-input bg-card px-3 text-sm leading-5 outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50')"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="option in props.options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>
