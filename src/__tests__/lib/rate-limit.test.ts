import { describe, it, expect, beforeEach, vi } from "vitest";

// We need to reset module state between tests
let canGenerate: typeof import("@/lib/rate-limit").canGenerate;
let recordGeneration: typeof import("@/lib/rate-limit").recordGeneration;

describe("rate-limit", () => {
  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("@/lib/rate-limit");
    canGenerate = mod.canGenerate;
    recordGeneration = mod.recordGeneration;
  });

  it("allows generation when no previous requests", () => {
    const status = canGenerate();
    expect(status.allowed).toBe(true);
    expect(status.minuteRemaining).toBe(5);
    expect(status.hourRemaining).toBe(30);
  });

  it("decrements remaining count after recording", () => {
    recordGeneration();
    const status = canGenerate();
    expect(status.allowed).toBe(true);
    expect(status.minuteRemaining).toBe(4);
    expect(status.hourRemaining).toBe(29);
  });

  it("blocks after 5 generations in a minute", () => {
    for (let i = 0; i < 5; i++) {
      recordGeneration();
    }
    const status = canGenerate();
    expect(status.allowed).toBe(false);
    expect(status.minuteRemaining).toBe(0);
    expect(status.nextAvailableIn).toBeGreaterThan(0);
  });
});
