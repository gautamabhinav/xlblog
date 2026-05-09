import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { createClient } from "redis";
import RedisStore from "rate-limit-redis";

const createRedisStore = () => {
  if (!process.env.REDIS_URL || process.env.REDIS_RATE_LIMIT_ENABLED !== "true") return undefined;

  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      tls: process.env.REDIS_URL?.startsWith("rediss://"),
    },
  });

  client.on("error", (error) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Redis rate-limit store unavailable, using memory fallback", error.message);
    }
  });

  client.connect().catch(() => {});

  return new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
  });
};

// helper → NEW STORE EVERY TIME
const withStore = (options) => {
  const store = createRedisStore();
  return rateLimit(store ? { ...options, store } : options);
};

const base = {
  windowMs: 15 * 60 * 1000,
  max: 1000,
  keyGenerator: ipKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
};

// ✅ Each limiter gets its OWN store instance
export const ipLimiter = withStore(base);

export const ultraStrictLimiter = withStore({
  ...base,
  windowMs: 5 * 60 * 1000,
  max: 5,
});

export const userLimiter = withStore({
  ...base,
  windowMs: 10 * 60 * 1000,
  max: 50,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
});
