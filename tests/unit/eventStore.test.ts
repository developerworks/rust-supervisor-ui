import { describe, expect, it, beforeEach } from "vitest";
import { eventStore } from "@/state/eventStore";
import { validStateSample } from "./protocolSamples";

describe("eventStore", () => {
  beforeEach(() => {
    eventStore.reset();
  });

  it("loads state events and dropped counts", () => {
    eventStore.applyDashboardState(validStateSample);

    expect(eventStore.state.events).toHaveLength(3);
    expect(eventStore.droppedEventTotal.value).toBe(2);
    expect(eventStore.droppedLogTotal.value).toBe(1);
    expect(eventStore.allRecords.value.map((record) => record.sequence).slice(0, 3)).toEqual([
      1001,
      1002,
      1002
    ]);
  });

  it("filters by event type, severity and correlation id", () => {
    eventStore.applyDashboardState(validStateSample);
    eventStore.setFilters({
      event_types: ["child_failed"],
      severities: ["error"],
      correlation_id: "restart-7"
    });

    expect(eventStore.filteredRecords.value).toHaveLength(1);
    expect(eventStore.filteredRecords.value[0].kind).toBe("event");
    if (eventStore.filteredRecords.value[0].kind === "event") {
      expect(eventStore.filteredRecords.value[0].event.target_path).toBe("/root/duplicate_guard");
    }
  });

  it("detects sequence regressions without reordering the visible stream", () => {
    eventStore.applyDashboardState(validStateSample);
    eventStore.appendEvent({
      ...validStateSample.recent_events[0],
      sequence: 999,
      correlation_id: "late-event"
    });

    expect(eventStore.state.sequenceDiagnostics[0]).toContain("sequence 999");
    expect(eventStore.state.events.map((event) => event.sequence)).toEqual([999, 1001, 1002, 1003]);
  });

  it("updates dropped counts from relay stream diagnostics", () => {
    eventStore.applyDashboardState(validStateSample);
    eventStore.setDroppedCount("payments-worker-a", 7, 3);

    expect(eventStore.droppedEventTotal.value).toBe(7);
    expect(eventStore.droppedLogTotal.value).toBe(3);
  });

  it("loads command state delta events and logs", () => {
    eventStore.applyStateDelta("payments-worker-a", {
      recent_events: [
        {
          ...validStateSample.recent_events[0],
          sequence: 7001,
          event_type: "child_removed",
          target_path: "/root/healthy_worker",
          payload: {
            child_path: "/root/healthy_worker",
            lifecycle_state: "removed"
          }
        }
      ],
      recent_logs: [
        {
          ...validStateSample.recent_logs[0],
          sequence: 8001,
          correlation_id: "cmd-remove-healthy-worker",
          message: "healthy worker remove_child completed",
          fields: {
            child_path: "/root/healthy_worker",
            lifecycle_state: "removed"
          }
        }
      ],
      dropped_event_count: 9,
      dropped_log_count: 4
    });

    expect(eventStore.state.events.some((event) => event.event_type === "child_removed")).toBe(true);
    expect(eventStore.state.logs.some((log) => log.message.includes("remove_child"))).toBe(true);
    expect(eventStore.droppedEventTotal.value).toBe(9);
    expect(eventStore.droppedLogTotal.value).toBe(4);
  });
});
