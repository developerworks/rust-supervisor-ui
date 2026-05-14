import { describe, expect, it } from "vitest";
import { displayTaskPath } from "@/lib/taskPath";

describe("task path display", () => {
  it("renders child task paths with hyphen separated words", () => {
    expect(displayTaskPath("/root/duplicate_guard")).toBe("/root/duplicate-guard");
    expect(displayTaskPath("/root/retry_scheduler")).toBe("/root/retry-scheduler");
  });

  it("keeps protocol paths unchanged when they do not contain underscores", () => {
    expect(displayTaskPath("/root")).toBe("/root");
    expect(displayTaskPath("/root/payment-loop")).toBe("/root/payment-loop");
  });
});
