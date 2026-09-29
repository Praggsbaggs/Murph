/**
 * In-memory sliding window rate limiter
 * Enforces request limits per client IP (e.g. 10 requests per IP per hour).
 */

interface RateLimitRecord {
  timestamps: number[];
}

const WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per hour

// Map of IP -> timestamps
const ipRequests = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale entries
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipRequests.entries()) {
      const active = record.timestamps.filter((t) => now - t < WINDOW_MS);
      if (active.length === 0) {
        ipRequests.delete(ip);
      } else {
        record.timestamps = active;
      }
    }
  }, 10 * 60 * 1000); // Clean every 10 minutes
}

export function checkRateLimit(ip: string): {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
} {
  const now = Date.now();
  const record = ipRequests.get(ip) || { timestamps: [] };

  // Filter timestamps within the 1-hour window
  const recentTimestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);

  if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recentTimestamps[0];
    const resetInSeconds = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return {
      success: false,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  // Allow request
  recentTimestamps.push(now);
  ipRequests.set(ip, { timestamps: recentTimestamps });

  return {
    success: true,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining: MAX_REQUESTS_PER_WINDOW - recentTimestamps.length,
    resetInSeconds: Math.ceil(WINDOW_MS / 1000),
  };
}
