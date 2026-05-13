<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Eraser, ListFilter } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { FieldStack, FormRoot, InlineGroup, PanelHeader, Section, Text } from "@/components/layout";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger
} from "@/components/ui/select";
import { eventStore } from "@/state/eventStore";
import { useProtocolLabels } from "@/i18n/protocolLabels";
import { stateStore } from "@/state/stateStore";
import type { LogEventFilterConditionsMessage, LifecycleState, Severity } from "@/types/protocol";

const emit = defineEmits<{
  filterUpdate: [message: LogEventFilterConditionsMessage];
}>();

const { t } = useI18n();
const protocolLabels = useProtocolLabels();
const allTargetValue = "__all_targets__";
const allChildPathValue = "__all_child_paths__";
const allLifecycleValue = "__all_lifecycle_states__";
const allEventTypeValue = "__all_event_types__";
const allSeverityValue = "__all_severities__";

const targetId = ref("");
const childPath = ref("");
const lifecycleState = ref("");
const eventType = ref("");
const severity = ref("");
const sequenceMin = ref("");
const correlationId = ref("");
const suppressAutoApply = ref(false);

const targetOptions = computed(() => [
  { value: allTargetValue, label: t("filters.allTargets") },
  ...stateStore.state.targets.map((target) => ({
    value: target.target_id,
    label: target.display_name
  }))
]);

const childPathOptions = computed(() => {
  const paths = new Set<string>();
  Object.values(stateStore.state.states).forEach((state) => {
    state.topology.nodes.forEach((node) => paths.add(node.path));
  });
  return [
    { value: allChildPathValue, label: t("filters.allChildTasks") },
    ...Array.from(paths).map((path) => ({ value: path, label: path }))
  ];
});

const eventTypeOptions = computed(() => {
  const eventTypes = new Set(eventStore.state.events.map((event) => event.event_type));
  return [
    { value: allEventTypeValue, label: t("filters.allEventTypes") },
    ...Array.from(eventTypes).map((type) => ({ value: type, label: protocolLabels.eventType(type) }))
  ];
});

const lifecycleOptions = computed(() => [
  { value: allLifecycleValue, label: t("filters.allLifecycleStates") },
  { value: "starting", label: t("lifecycle.starting") },
  { value: "running", label: t("lifecycle.running") },
  { value: "failed", label: t("lifecycle.failed") },
  { value: "restarting", label: t("lifecycle.restarting") },
  { value: "paused", label: t("lifecycle.paused") },
  { value: "quarantined", label: t("lifecycle.quarantined") },
  { value: "stopping", label: t("lifecycle.stopping") },
  { value: "stopped", label: t("lifecycle.stopped") },
  { value: "completed", label: t("lifecycle.completed") }
]);

const severityOptions = computed(() => [
  { value: allSeverityValue, label: t("filters.allSeverities") },
  { value: "trace", label: t("severity.trace") },
  { value: "debug", label: t("severity.debug") },
  { value: "info", label: t("severity.info") },
  { value: "warning", label: t("severity.warning") },
  { value: "error", label: t("severity.error") }
]);

const targetSelectValue = computed({
  get: () => targetId.value || allTargetValue,
  set: (value: string) => {
    targetId.value = value === allTargetValue ? "" : value;
  }
});

const childPathSelectValue = computed({
  get: () => childPath.value || allChildPathValue,
  set: (value: string) => {
    childPath.value = value === allChildPathValue ? "" : value;
  }
});

const lifecycleSelectValue = computed({
  get: () => lifecycleState.value || allLifecycleValue,
  set: (value: string) => {
    lifecycleState.value = value === allLifecycleValue ? "" : value;
  }
});

const eventTypeSelectValue = computed({
  get: () => eventType.value || allEventTypeValue,
  set: (value: string) => {
    eventType.value = value === allEventTypeValue ? "" : value;
  }
});

const severitySelectValue = computed({
  get: () => severity.value || allSeverityValue,
  set: (value: string) => {
    severity.value = value === allSeverityValue ? "" : value;
  }
});

const targetSelectLabel = computed(
  () => targetOptions.value.find((option) => option.value === targetSelectValue.value)?.label ?? t("filters.allTargets")
);
const childPathSelectLabel = computed(
  () => childPathOptions.value.find((option) => option.value === childPathSelectValue.value)?.label ?? t("filters.allChildTasks")
);
const lifecycleSelectLabel = computed(
  () => lifecycleOptions.value.find((option) => option.value === lifecycleSelectValue.value)?.label ?? t("filters.allLifecycleStates")
);
const eventTypeSelectLabel = computed(
  () => eventTypeOptions.value.find((option) => option.value === eventTypeSelectValue.value)?.label ?? t("filters.allEventTypes")
);
const severitySelectLabel = computed(
  () => severityOptions.value.find((option) => option.value === severitySelectValue.value)?.label ?? t("filters.allSeverities")
);

watch([targetId, childPath, lifecycleState, eventType, severity, sequenceMin, correlationId], () => {
  if (suppressAutoApply.value) {
    return;
  }
  emitCurrentFilters();
}, { flush: "sync" });

function emitCurrentFilters(): void {
  const sequenceMinimum = Number(sequenceMin.value);
  const update = eventStore.setFilters({
    target_ids: targetId.value ? [targetId.value] : [],
    child_paths: childPath.value ? [childPath.value] : [],
    lifecycle_states: lifecycleState.value ? [lifecycleState.value as LifecycleState] : [],
    event_types: eventType.value ? [eventType.value] : [],
    severities: severity.value ? [severity.value as Severity] : [],
    sequence_min: sequenceMin.value && Number.isFinite(sequenceMinimum) ? sequenceMinimum : undefined,
    correlation_id: correlationId.value || undefined
  });
  emit("filterUpdate", update);
}

function clearFilters(): void {
  suppressAutoApply.value = true;
  targetId.value = "";
  childPath.value = "";
  lifecycleState.value = "";
  eventType.value = "";
  severity.value = "";
  sequenceMin.value = "";
  correlationId.value = "";
  suppressAutoApply.value = false;
  emit("filterUpdate", eventStore.clearFilters());
}
</script>

<template>
  <Section aria-label="filters">
    <PanelHeader
      class="mb-3"
      :eyebrow="t('sections.filters')"
      :title="t('sections.filterTitle')"
    >
      <ListFilter class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
    </PanelHeader>

    <FormRoot class="grid gap-3" data-testid="filter-form">
      <FieldStack>
        <Label for="target-filter">{{ t("filters.targetIdentity") }}</Label>
        <Select v-model="targetSelectValue">
          <SelectTrigger id="target-filter" aria-label="target filter">
            <Text as="span" class="truncate">{{ targetSelectLabel }}</Text>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="option in targetOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </FieldStack>
      <FieldStack>
        <Label for="child-filter">{{ t("filters.childTask") }}</Label>
        <Select v-model="childPathSelectValue">
          <SelectTrigger id="child-filter" aria-label="child filter">
            <Text as="span" class="truncate">{{ childPathSelectLabel }}</Text>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="option in childPathOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </FieldStack>
      <FieldStack>
        <Label for="state-filter">{{ t("filters.lifecycleState") }}</Label>
        <Select v-model="lifecycleSelectValue">
          <SelectTrigger id="state-filter" aria-label="lifecycle filter">
            <Text as="span" class="truncate">{{ lifecycleSelectLabel }}</Text>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="option in lifecycleOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </FieldStack>
      <FieldStack>
        <Label for="event-filter">{{ t("filters.eventType") }}</Label>
        <Select v-model="eventTypeSelectValue">
          <SelectTrigger id="event-filter" aria-label="event type filter">
            <Text as="span" class="truncate">{{ eventTypeSelectLabel }}</Text>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="option in eventTypeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </FieldStack>
      <FieldStack>
        <Label for="severity-filter">{{ t("filters.severity") }}</Label>
        <Select v-model="severitySelectValue">
          <SelectTrigger id="severity-filter" aria-label="severity filter">
            <Text as="span" class="truncate">{{ severitySelectLabel }}</Text>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="option in severityOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </FieldStack>
      <FieldStack>
        <Label for="sequence-filter">{{ t("filters.sequenceMinimum") }}</Label>
        <Input id="sequence-filter" v-model="sequenceMin" type="number" aria-label="sequence filter" placeholder="1000" />
      </FieldStack>
      <FieldStack>
        <Label for="correlation-filter">{{ t("filters.correlationId") }}</Label>
        <Input id="correlation-filter" v-model="correlationId" aria-label="correlation filter" placeholder="restart-7" />
      </FieldStack>
      <InlineGroup class="items-end gap-2">
        <Button type="button" variant="outline" class="w-full" @click="clearFilters">
          <Eraser class="h-4 w-4" aria-hidden="true" />
          {{ t("common.clear") }}
        </Button>
      </InlineGroup>
    </FormRoot>
  </Section>
</template>
