<script setup lang="ts">
import { computed } from "vue";
import { BaseEdge, type EdgeProps } from "@vue-flow/core";
import { buildOffsetBezierPath, type TopologyEdgeData } from "./edgeLayout";

const props = defineProps<EdgeProps<TopologyEdgeData>>();

const edgePath = computed(() =>
  buildOffsetBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    curveOffset: props.data?.curveOffset ?? 0
  })
);
</script>

<template>
  <BaseEdge
    :id="props.id"
    :path="edgePath.path"
    :label="props.label"
    :label-x="edgePath.labelX"
    :label-y="edgePath.labelY"
    :marker-start="props.markerStart"
    :marker-end="props.markerEnd"
    :interaction-width="props.interactionWidth"
    :label-style="props.labelStyle"
    :label-show-bg="props.labelShowBg"
    :label-bg-style="props.labelBgStyle"
    :label-bg-padding="props.labelBgPadding"
    :label-bg-border-radius="props.labelBgBorderRadius"
  />
</template>
