<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

defineEmits<{
  submit: [event: SubmitEvent];
}>();
</script>

<template>
  <form :class="cn(props.class)" @submit.prevent="$emit('submit', $event)">
    <slot />
  </form>
</template>
