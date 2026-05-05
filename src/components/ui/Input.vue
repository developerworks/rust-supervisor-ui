<script setup lang="ts">
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    ariaLabel?: string;
  }>(),
  {
    modelValue: "",
    type: "text",
    placeholder: "",
    disabled: false,
    ariaLabel: undefined
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
}>();
</script>

<template>
  <input
    :type="props.type"
    :value="props.modelValue"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :aria-label="props.ariaLabel"
    :class="cn('h-9 w-full rounded-md border border-input bg-card px-3 text-sm leading-5 outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50')"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
