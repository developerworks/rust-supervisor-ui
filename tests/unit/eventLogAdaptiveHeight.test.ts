import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const eventLogPanel = resolve(repoRoot, "src/components/EventLogPanel.vue");

describe("event log adaptive height", () => {
  it("lets event and log rows grow with their content", () => {
    const source = readFileSync(eventLogPanel, "utf8");

    expect(source).toContain("data-testid=\"event-log\"");
    expect(source).not.toContain("max-h-[28rem]");
    expect(source).not.toContain("truncate font-semibold");
    expect(source).not.toContain("truncate text-xs");
    expect(source).toContain("break-words font-semibold text-foreground");
    expect(source).toContain("whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground");
  });
});
