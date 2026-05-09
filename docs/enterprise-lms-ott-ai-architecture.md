# Enterprise LMS + OTT + AI Architecture

## Updated Scalable Folder Structure

```text
client/src/
  Components/OTT/             # Streaming player, rails, OTT UI primitives
  Components/Voice/           # Voice recorder, waveform, speech-to-text panels
  Hooks/                      # Reusable browser/media/API hooks
  Pages/OTT/                  # Premium OTT experience and enterprise dashboard
server/src/
  controllers/platform/       # Video, voice, platform, audit controllers
  middlewares/platform/       # Cache, security, request context, streaming guards
  models/platform/            # VideoAsset, VideoProgress, interactions, voice, audit logs
  routes/platform/            # /videos, /voice, /platform APIs
  services/platform/          # Redis cache, queue, streaming source builders
infra/
  k8s/                        # Kubernetes-ready manifests
  nginx/                      # CDN/edge/reverse-proxy config
.github/workflows/            # CI/CD starter pipeline
```

## Enterprise Architecture Overview

The platform remains a modular MERN monolith today, with microservice-ready boundaries for video, AI, voice, realtime, payments, tests, and content. Stateless Node.js replicas sit behind NGINX or a cloud load balancer. MongoDB stores core data with sharding-ready indexes. Redis powers distributed cache, rate limiting, future Socket.IO scaling, and BullMQ workers. Cloudinary stays as the current media origin, with a CDN host layered in front for HLS/DASH delivery.

## Backend Upgrades

- New APIs: `/api/v1/videos`, `/api/v1/voice`, `/api/v1/platform/architecture`.
- New collections: `VideoAsset`, `VideoProgress`, `VideoInteraction`, `VoiceRecording`, `AuditLog`.
- Added request IDs, security headers, Redis-aware API caching, streaming token placeholders, and queue contracts.
- Existing course/test/blog/payment APIs are preserved.

## Frontend Upgrades

- New `/ott` route with Netflix/Udemy-style video learning surface.
- New `/enterprise/dashboard` route for premium operational analytics.
- Reusable `OTTVideoPlayer` with resume playback, speed control, theater mode, mini-player, bookmarks, chapters, notes, subtitle and DRM placeholders.
- Reusable `VoiceCommandPanel` using MediaRecorder and Web Speech API.

## Streaming Architecture

Upload source video to Cloudinary or object storage, create a `VideoAsset`, enqueue `video.transcode`, generate an HLS ladder with FFmpeg workers, store renditions and manifest URLs, and serve via CDN. The model supports HLS now, DASH and LL-HLS placeholders, DRM policies, subtitles, chapters, previews, AI transcripts, watermark flags, anti-download flags, and heatmap analytics.

## Voice Architecture

Browser voice capture uses MediaRecorder and Web Speech API. The server stores recording metadata and transcript text. The contract is ready for cloud STT, AI audio enhancement, noise suppression, voice answers in exams, voice notes, voice search, and AI voice assistant flows.

## Realtime Architecture

Socket.IO now includes presence rooms, classroom joins, live reactions, typing indicators, and quiz update events. For multi-node production, add the Socket.IO Redis adapter so events fan out across pods.

## Redis, Queue, CDN

Redis is optional locally and production-ready through `REDIS_URL`. Cache middleware degrades safely without Redis. Queue service is a BullMQ-ready placeholder today; production workers should consume `video.transcode`, `ai.transcript`, `ai.summary`, `ai.moderation`, and notification fan-out jobs. CDN delivery is controlled by `CDN_HOST` and edge TTL environment variables.

## MongoDB Optimization

Indexes were added for text search, video status, user progress, continue watching, interactions, voice transcripts, and audit trails. For sharding, prefer high-cardinality keys such as `{ user: hashed }` for user activity collections and `{ course: hashed }` or `{ status, updatedAt }` for video workflows depending on access patterns.

## Security Strategies

Use JWT access tokens with secure refresh cookies, role guards, request throttling, request IDs, audit logs, signed streaming URLs, device/session tracking, strict CORS, security headers, and admin-only creation routes. Production should add CSP tuning, secrets management, WAF rules, and DRM provider integration.

## Performance Optimizations

The frontend uses route-level code separation opportunities, reusable hooks, responsive layouts, skeleton-friendly UI, and media controls that avoid page rewrites. Backend read APIs support pagination and caching. Video delivery should be served from CDN edges, while progress and analytics writes stay small and idempotent.

## AI-Ready Architecture

AI tutor, summaries, recommendations, generated quizzes, moderation, semantic search, analytics, transcripts, and chatbot workflows should run asynchronously through queue workers. Store outputs on domain models and keep LLM providers behind service interfaces.
