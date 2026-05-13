<script setup lang="ts">
import { useAttrs, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const attrs = useAttrs();
</script>

<template>
  <header v-bind="attrs" :class="cn('border-b bg-card/90 backdrop-blur', props.class)">
    <slot />
  </header>
</template>
