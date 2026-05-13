import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const eventLogPanel = resolve(repoRoot, "src/components/EventLogPanel.vue");

describe("event log panel layout", () => {
  it("lets the event stream height and rows adapt to content", () => {
    const source = readFileSync(eventLogPanel, "utf8");

    expect(source).not.toContain("max-h-[28rem]");
    expect(source).not.toContain("truncate font-semibold");
    expect(source).not.toContain("truncate text-xs");
    expect(source).toContain("data-testid=\"event-log\"");
    expect(source).toContain("whitespace-pre-wrap");
    expect(source).toContain("lifecycleTransitionDetail");
    expect(source).toContain("eventLog.lifecycleTransition");
    expect(source).toContain("Table");
    expect(source).toContain("pagedRecords");
    expect(source).toContain("data-testid=\"event-log-pagination\"");
    expect(source).toContain("data-testid=\"event-log-page-next\"");
    expect(source).toContain("data-testid=\"event-log-page-previous\"");
  });
});
