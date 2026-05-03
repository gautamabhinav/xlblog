import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "exam-platform-api" },
  transports: [new winston.transports.Console()],
});

export const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    logger.info("http_request", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      userId: req.user?._id,
      ip: req.ip,
    });
  });
  next();
};

export default logger;
