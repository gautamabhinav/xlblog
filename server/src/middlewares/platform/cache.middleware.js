import { cacheGet, cacheSet } from "../../services/platform/cache.service.js";

export const cacheResponse = ({ ttlSeconds = 60, varyByUser = false, namespace = "api" } = {}) => {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();

    const userKey = varyByUser ? req.user?._id || req.user?.id || "anonymous" : "public";
    const key = `${namespace}:${userKey}:${req.originalUrl}`;
    const cached = await cacheGet(key);

    if (cached) {
      res.set("X-Cache", "HIT");
      return res.status(cached.status).json(cached.body);
    }

    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await cacheSet(key, { status: res.statusCode, body }, ttlSeconds);
      }
      res.set("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
};
