import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

/**
 * The limiter keeps its counter Map on globalThis so HMR does not reset
 * it, which also means state is shared across these tests — each test
 * uses its own key to stay independent. Fake timers make the fixed
 * windows deterministic.
 */

const WINDOW_MS = 60 * 1000;

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows hits up to the max, then blocks with a retry hint", () => {
    const key = "test:allows-then-blocks";

    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit(key, 3, WINDOW_MS)).toEqual({
        ok: true,
        retryAfterSec: 0,
      });
    }

    const blocked = rateLimit(key, 3, WINDOW_MS);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it("reports the whole seconds left until the window resets", () => {
    const key = "test:retry-seconds";

    rateLimit(key, 1, WINDOW_MS);
    vi.advanceTimersByTime(10_000);

    const blocked = rateLimit(key, 1, WINDOW_MS);
    expect(blocked).toEqual({ ok: false, retryAfterSec: 50 });
  });

  it("resets the counter after the window expires", () => {
    const key = "test:window-reset";

    expect(rateLimit(key, 1, WINDOW_MS).ok).toBe(true);
    expect(rateLimit(key, 1, WINDOW_MS).ok).toBe(false);

    vi.advanceTimersByTime(WINDOW_MS + 1);
    expect(rateLimit(key, 1, WINDOW_MS)).toEqual({
      ok: true,
      retryAfterSec: 0,
    });
  });

  it("tracks keys independently", () => {
    expect(rateLimit("test:independent-a", 1, WINDOW_MS).ok).toBe(true);
    expect(rateLimit("test:independent-b", 1, WINDOW_MS).ok).toBe(true);
    expect(rateLimit("test:independent-a", 1, WINDOW_MS).ok).toBe(false);
  });
});
