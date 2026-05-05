<script setup lang="ts">
import { cn } from "@/lib/utils";
</script>

<template>
  <label :class="cn('text-xs font-semibold leading-5 text-slate-700')">
    <slot />
  </label>
</template>
