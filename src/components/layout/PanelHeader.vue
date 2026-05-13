<script setup lang="ts">
import type { Component } from "vue";
import Heading from "@/components/layout/Heading.vue";
import InlineGroup from "@/components/layout/InlineGroup.vue";
import Stack from "@/components/layout/Stack.vue";
import Text from "@/components/layout/Text.vue";

defineProps<{
  eyebrow: string;
  title: string;
  icon?: Component;
}>();
</script>

<template>
  <InlineGroup class="mb-3" justify="between" align="center">
    <Stack gap="none">
      <Text variant="muted-label">{{ eyebrow }}</Text>
      <Heading level="2" variant="panel">{{ title }}</Heading>
    </Stack>
    <component :is="icon" v-if="icon" class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    <slot />
  </InlineGroup>
</template>
