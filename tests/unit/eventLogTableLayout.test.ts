import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const eventLogPanel = resolve(repoRoot, "src/components/EventLogPanel.vue");

describe("event log table layout", () => {
  it("renders event and log records with an adaptive table", () => {
    const source = readFileSync(eventLogPanel, "utf8");

    expect(source).toContain("@/components/ui/table");
    expect(source).toContain("<Table>");
    expect(source).toContain("<TableHeader>");
    expect(source).toContain("<TableBody>");
    expect(source).toContain("v-for=\"record in records\"");
    expect(source).toContain("data-testid=\"timeline-record\"");
    expect(source).toContain("whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground");
    expect(source).not.toContain("max-h-[28rem]");
    expect(source).not.toContain("pagedRecords");
    expect(source).not.toContain("data-testid=\"event-log-pagination\"");
  });
});
