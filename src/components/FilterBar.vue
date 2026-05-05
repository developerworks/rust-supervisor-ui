<script setup lang="ts">
import { computed, ref } from "vue";
import { Eraser, ListFilter } from "lucide-vue-next";
import Button from "@/components/ui/Button.vue";
import Card from "@/components/ui/Card.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import Select from "@/components/ui/Select.vue";
import { eventStore } from "@/state/eventStore";
import { snapshotStore } from "@/state/snapshotStore";
import type { FilterUpdate, LifecycleState, Severity } from "@/types/protocol";

const emit = defineEmits<{
  filterUpdate: [message: FilterUpdate];
}>();

const targetId = ref("");
const childPath = ref("");
const lifecycleState = ref("");
const eventType = ref("");
const severity = ref("");
const sequenceFrom = ref("");
const correlationId = ref("");

const targetOptions = computed(() => [
  { value: "", label: "全部目标" },
  ...snapshotStore.state.targets.map((target) => ({
    value: target.target_id,
    label: target.display_name
  }))
]);

const childPathOptions = computed(() => {
  const paths = new Set<string>();
  Object.values(snapshotStore.state.snapshots).forEach((snapshot) => {
    snapshot.topology.nodes.forEach((node) => paths.add(node.path));
  });
  return [
    { value: "", label: "全部子任务" },
    ...Array.from(paths).map((path) => ({ value: path, label: path }))
  ];
});

const eventTypeOptions = computed(() => {
  const eventTypes = new Set(eventStore.state.events.map((event) => event.event_type));
  return [
    { value: "", label: "全部事件类型" },
    ...Array.from(eventTypes).map((type) => ({ value: type, label: type }))
  ];
});

const lifecycleOptions = [
  { value: "", label: "全部生命周期" },
  { value: "running", label: "running(运行中)" },
  { value: "failed", label: "failed(失败)" },
  { value: "restarting", label: "restarting(重启中)" },
  { value: "paused", label: "paused(暂停)" },
  { value: "quarantined", label: "quarantined(隔离)" },
  { value: "stopped", label: "stopped(已停止)" }
];

const severityOptions = [
  { value: "", label: "全部严重程度" },
  { value: "info", label: "info(信息)" },
  { value: "warning", label: "warning(警告)" },
  { value: "error", label: "error(错误)" }
];

function applyFilters(): void {
  const update = eventStore.setFilters({
    target_ids: targetId.value ? [targetId.value] : [],
    child_paths: childPath.value ? [childPath.value] : [],
    lifecycle_states: lifecycleState.value ? [lifecycleState.value as LifecycleState] : [],
    event_types: eventType.value ? [eventType.value] : [],
    severities: severity.value ? [severity.value as Severity] : [],
    sequence_from: sequenceFrom.value ? Number(sequenceFrom.value) : undefined,
    correlation_id: correlationId.value || undefined
  });
  emit("filterUpdate", update);
}

function clearFilters(): void {
  targetId.value = "";
  childPath.value = "";
  lifecycleState.value = "";
  eventType.value = "";
  severity.value = "";
  sequenceFrom.value = "";
  correlationId.value = "";
  emit("filterUpdate", eventStore.clearFilters());
}
</script>

<template>
  <Card aria-label="filters">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="muted-label">filters(过滤器)</p>
        <h2 class="panel-title">日志过滤</h2>
      </div>
      <ListFilter class="h-5 w-5 text-slate-500" aria-hidden="true" />
    </div>

    <form class="grid gap-3 md:grid-cols-2 xl:grid-cols-4" @submit.prevent="applyFilters">
      <div class="space-y-1.5">
        <Label for="target-filter">target process identity(目标进程身份)</Label>
        <Select id="target-filter" v-model="targetId" ariaLabel="target filter" :options="targetOptions" />
      </div>
      <div class="space-y-1.5">
        <Label for="child-filter">child task(子任务)</Label>
        <Select id="child-filter" v-model="childPath" ariaLabel="child filter" :options="childPathOptions" />
      </div>
      <div class="space-y-1.5">
        <Label for="state-filter">lifecycle state(生命周期状态)</Label>
        <Select id="state-filter" v-model="lifecycleState" ariaLabel="lifecycle filter" :options="lifecycleOptions" />
      </div>
      <div class="space-y-1.5">
        <Label for="event-filter">event type(事件类型)</Label>
        <Select id="event-filter" v-model="eventType" ariaLabel="event type filter" :options="eventTypeOptions" />
      </div>
      <div class="space-y-1.5">
        <Label for="severity-filter">severity(严重程度)</Label>
        <Select id="severity-filter" v-model="severity" ariaLabel="severity filter" :options="severityOptions" />
      </div>
      <div class="space-y-1.5">
        <Label for="sequence-filter">sequence from(起始序号)</Label>
        <Input id="sequence-filter" v-model="sequenceFrom" type="number" aria-label="sequence filter" placeholder="1000" />
      </div>
      <div class="space-y-1.5">
        <Label for="correlation-filter">correlation id(关联标识)</Label>
        <Input id="correlation-filter" v-model="correlationId" aria-label="correlation filter" placeholder="restart-7" />
      </div>
      <div class="flex items-end gap-2">
        <Button type="submit" class="flex-1">
          <ListFilter class="h-4 w-4" aria-hidden="true" />
          应用
        </Button>
        <Button type="button" variant="outline" @click="clearFilters">
          <Eraser class="h-4 w-4" aria-hidden="true" />
          清除
        </Button>
      </div>
    </form>
  </Card>
</template>
