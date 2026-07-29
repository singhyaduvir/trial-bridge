import { NextResponse, type NextRequest } from 'next/server';

const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 60;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  windowMs?: number;
  maxRequests?: number;
};

type RequestLike = Pick<Request | NextRequest, 'headers'>;

const rateLimitEntries = new Map<string, RateLimitEntry>();

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitEntries.entries()) {
    if (entry.resetAt <= now) {
      rateLimitEntries.delete(key);
    }
  }
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_RATE_LIMIT_MAX_REQUESTS;

  return {
    check(request: RequestLike, identifierPrefix = 'api') {
      const now = Date.now();
      pruneExpiredEntries(now);

      const clientId = getClientIdentifier(request);
      const key = `${identifierPrefix}:${clientId}`;
      const existing = rateLimitEntries.get(key);

      if (!existing || existing.resetAt <= now) {
        const resetAt = now + windowMs;
        rateLimitEntries.set(key, { count: 1, resetAt });
        return { allowed: true, retryAfterSeconds: Math.ceil((resetAt - now) / 1000) };
      }

      if (existing.count >= maxRequests) {
        return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
      }

      existing.count += 1;
      return { allowed: true, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
    },
  };
}

export const defaultApiRateLimiter = createRateLimiter();

export function getClientIdentifier(request: RequestLike): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  return forwardedFor || realIp || 'unknown';
}

export function enforceRateLimit(request: RequestLike, identifierPrefix = 'api') {
  const result = defaultApiRateLimiter.check(request, identifierPrefix);

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfterSeconds ?? 60),
        },
      },
    );
  }

  return null;
}

export function createApiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function sanitizeError(error: unknown, fallback = 'Request failed.') {
  if (error instanceof Error) {
    if (error.message.includes('fetch failed') || error.message.includes('ECONNRESET')) {
      return 'Upstream service is temporarily unavailable.';
    }

    if (error.message.includes('Failed to fetch')) {
      return 'Upstream service is temporarily unavailable.';
    }

    return error.message;
  }

  return fallback;
}

export function parseOptionalString(value: string | null | undefined, maxLength = 120) {
  if (value == null) return undefined;

  const normalized = value.trim();
  if (!normalized) return undefined;

  return normalized.slice(0, maxLength);
}

export function parsePositiveInt(value: string | null | undefined, defaultValue: number, maxValue: number) {
  if (value == null) return defaultValue;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > maxValue) {
    return defaultValue;
  }

  return parsed;
}

export function isValidUuid(value: string | null | undefined) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isValidNctId(value: string | null | undefined) {
  if (!value) return false;
  return /^NCT\d{8}$/i.test(value.trim());
}

export function sanitizeFilename(name: string) {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .slice(0, 120) || 'document';
}
