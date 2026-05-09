import { createClient } from "redis";

let redisClient;
let redisReady = false;

export const getRedisClient = () => {
  if (!process.env.REDIS_URL) return null;
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      tls: process.env.REDIS_URL.startsWith("rediss://"),
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
  });

  redisClient.on("ready", () => {
    redisReady = true;
  });

  redisClient.on("error", (error) => {
    redisReady = false;
    if (process.env.NODE_ENV !== "test") {
      console.warn("Redis unavailable, continuing without distributed cache", error.message);
    }
  });

  redisClient.connect().catch(() => {
    redisReady = false;
  });

  return redisClient;
};

export const cacheGet = async (key) => {
  const client = getRedisClient();
  if (!client || !redisReady) return null;
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
};

export const cacheSet = async (key, value, ttlSeconds = 60) => {
  const client = getRedisClient();
  if (!client || !redisReady) return;
  await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
};

export const cacheDeletePattern = async (pattern) => {
  const client = getRedisClient();
  if (!client || !redisReady) return;
  for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    await client.del(key);
  }
};

export const cacheStatus = () => ({
  enabled: Boolean(process.env.REDIS_URL),
  ready: redisReady,
});
