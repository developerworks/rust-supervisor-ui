<script setup lang="ts">
import { useAttrs, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const attrs = useAttrs();
</script>

<template>
  <main v-bind="attrs" :class="cn('dashboard-shell min-h-screen text-foreground', props.class)">
    <slot />
  </main>
</template>
