<script setup lang="ts">
import { computed, useAttrs, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(
  defineProps<{
    as?: string;
    class?: HTMLAttributes["class"];
  }>(),
  {
    as: "div"
  }
);

const attrs = useAttrs();
const classes = computed(() => cn(props.class));
</script>

<template>
  <component :is="props.as" v-bind="attrs" :class="classes">
    <slot />
  </component>
</template>
