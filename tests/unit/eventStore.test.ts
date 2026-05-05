import { describe, expect, it, beforeEach } from "vitest";
import { paymentsSnapshot } from "@/mock/dashboardData";
import { eventStore } from "@/state/eventStore";

describe("eventStore", () => {
  beforeEach(() => {
    eventStore.reset();
  });

  it("loads snapshot events and dropped counts", () => {
    eventStore.applySnapshot(paymentsSnapshot);

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
    eventStore.applySnapshot(paymentsSnapshot);
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
    eventStore.applySnapshot(paymentsSnapshot);
    eventStore.appendEvent({
      ...paymentsSnapshot.recent_events[0],
      sequence: 999,
      correlation_id: "late-event"
    });

    expect(eventStore.state.sequenceDiagnostics[0]).toContain("sequence 999");
    expect(eventStore.state.events.map((event) => event.sequence)).toEqual([999, 1001, 1002, 1003]);
  });

  it("updates dropped counts from relay stream diagnostics", () => {
    eventStore.applySnapshot(paymentsSnapshot);
    eventStore.setDroppedCount("payments-worker-a", 7, 3);

    expect(eventStore.droppedEventTotal.value).toBe(7);
    expect(eventStore.droppedLogTotal.value).toBe(3);
  });
});
