import logger from "../utils/logger.js";

const errorMiddleware = (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Something went wrong";

  logger.error("request_error", {
    statusCode: err.statusCode,
    message: err.message,
    stack: err.stack,
  });

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
};

export default errorMiddleware;
