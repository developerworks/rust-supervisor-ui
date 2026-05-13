import { useI18n } from "vue-i18n";
import type {
  ControlCommandName,
  Criticality,
  HealthState,
  LifecycleState,
  ReadinessState,
  Severity
} from "@/types/protocol";

function humanizeProtocolValue(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function useProtocolLabels() {
  const { t, te } = useI18n();

  function translate(namespace: string, value: string): string {
    const key = `${namespace}.${value}`;
    return te(key) ? t(key) : humanizeProtocolValue(value);
  }

  function command(value: ControlCommandName | string): string {
    return translate("control.commands", value);
  }

  function lifecycle(value: LifecycleState | string): string {
    return translate("lifecycle", value);
  }

  function stateSummary(value: string): string {
    const lifecycleKey = `lifecycle.${value}`;
    if (te(lifecycleKey)) {
      return t(lifecycleKey);
    }
    return translate("nodeState", value);
  }

  function severity(value: Severity | string): string {
    return translate("severity", value);
  }

  function health(value: HealthState | string): string {
    return translate("health", value);
  }

  function readiness(value: ReadinessState | string): string {
    return translate("readiness", value);
  }

  function criticality(value: Criticality | string): string {
    return translate("criticality", value);
  }

  function eventType(value: string): string {
    return translate("eventType", value);
  }

  function commandStatus(value: string): string {
    return translate("commandStatus", value);
  }

  return {
    command,
    lifecycle,
    stateSummary,
    severity,
    health,
    readiness,
    criticality,
    eventType,
    commandStatus
  };
}
