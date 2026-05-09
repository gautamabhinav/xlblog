export const securityHeaders = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), geolocation=(), payment=(), microphone=(self)");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
};

export const requestContext = (req, res, next) => {
  const requestId = req.headers["x-request-id"] || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};

export const streamingTokenGuard = (req, _res, next) => {
  req.streamingPolicy = {
    signedPlayback: Boolean(process.env.STREAMING_SIGNING_SECRET),
    cdnHost: process.env.CDN_HOST || "",
    drmReady: Boolean(process.env.DRM_PROVIDER),
  };
  next();
};
