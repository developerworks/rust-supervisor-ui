<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <td :class="cn('px-3 py-3 align-top', $props.class)">
    <slot />
  </td>
</template>
