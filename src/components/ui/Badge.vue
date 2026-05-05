<script setup lang="ts">
import { cva, type VariantProps } from "class-variance-authority";
import { computed } from "vue";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium leading-5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        danger: "border-red-200 bg-red-50 text-red-700",
        warning: "border-amber-200 bg-amber-50 text-amber-800",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        muted: "border-slate-200 bg-slate-100 text-slate-700"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

type BadgeVariants = VariantProps<typeof badgeVariants>;

const props = withDefaults(
  defineProps<{
    variant?: BadgeVariants["variant"];
  }>(),
  {
    variant: "default"
  }
);

const classes = computed(() => cn(badgeVariants({ variant: props.variant })));
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
