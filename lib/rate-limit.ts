type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const map = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string, max = 10, windowMs = 60_000) {
  const now = Date.now();
  const existing = map.get(key);

  if (!existing || existing.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= max) {
    return false;
  }

  existing.count += 1;
  map.set(key, existing);
  return true;
}
