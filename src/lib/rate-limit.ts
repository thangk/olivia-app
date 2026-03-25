const MAX_PER_MINUTE = 5;
const MAX_PER_HOUR = 30;

let timestamps: number[] = [];

export function canGenerate(): {
  allowed: boolean;
  minuteRemaining: number;
  hourRemaining: number;
  nextAvailableIn: number | null;
} {
  const now = Date.now();
  // Clean old entries
  timestamps = timestamps.filter((t) => now - t < 3600_000);

  const lastMinute = timestamps.filter((t) => now - t < 60_000);
  const lastHour = timestamps;

  const minuteRemaining = MAX_PER_MINUTE - lastMinute.length;
  const hourRemaining = MAX_PER_HOUR - lastHour.length;
  const allowed = minuteRemaining > 0 && hourRemaining > 0;

  let nextAvailableIn: number | null = null;
  if (!allowed) {
    if (minuteRemaining <= 0 && lastMinute.length > 0) {
      // Wait for oldest minute-window entry to expire
      nextAvailableIn = Math.ceil((60_000 - (now - lastMinute[0])) / 1000);
    } else if (hourRemaining <= 0 && lastHour.length > 0) {
      nextAvailableIn = Math.ceil((3600_000 - (now - lastHour[0])) / 1000);
    }
  }

  return { allowed, minuteRemaining, hourRemaining, nextAvailableIn };
}

export function recordGeneration(): void {
  timestamps.push(Date.now());
}

export function getRateLimitStatus() {
  return canGenerate();
}
