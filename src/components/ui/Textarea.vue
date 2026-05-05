<script setup lang="ts">
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    rows?: number;
    ariaLabel?: string;
  }>(),
  {
    modelValue: "",
    placeholder: "",
    rows: 3,
    ariaLabel: undefined
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <textarea
    :value="props.modelValue"
    :placeholder="props.placeholder"
    :rows="props.rows"
    :aria-label="props.ariaLabel"
    :class="cn('min-h-20 w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-sm leading-5 outline-none transition focus:ring-2 focus:ring-ring')"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
