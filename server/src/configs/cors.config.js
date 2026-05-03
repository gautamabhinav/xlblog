import { config } from "dotenv";

config();

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5014",
  "https://xlblog-1.onrender.com",
];

const normalizeOrigin = (origin) => origin.replace(/\/+$/, "");

const parseOrigins = (value) =>
  value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .map(normalizeOrigin)
        .filter(Boolean)
    : [];

export const allowedOrigins = [
  ...DEFAULT_ALLOWED_ORIGINS.map(normalizeOrigin),
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.CORS_ORIGIN),
  ...parseOrigins(process.env.CORS_ORIGINS),
  ...parseOrigins(process.env.ALLOWED_ORIGINS),
].filter((origin, index, origins) => origins.indexOf(origin) === index);

export const isAllowedOrigin = (origin) =>
  !origin || allowedOrigins.includes(origin);

export const corsOriginDelegate = (origin, callback) => {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Not allowed by CORS: ${origin}`));
};
