export const buildPlaybackSources = (video) => {
  const hlsUrl = video?.playback?.hlsUrl || video?.playback?.mp4Url || "";
  const dashUrl = video?.playback?.dashUrl || "";

  return {
    hls: hlsUrl,
    dash: dashUrl,
    mp4: video?.playback?.mp4Url || "",
    qualities: video?.qualities || [],
    subtitles: video?.subtitles || [],
    chapters: video?.chapters || [],
    drm: {
      enabled: video?.playback?.drmPolicy && video.playback.drmPolicy !== "none",
      policy: video?.playback?.drmPolicy || "none",
    },
    cdn: {
      ready: Boolean(process.env.CDN_HOST),
      host: process.env.CDN_HOST || "",
      edgeCacheSeconds: Number(process.env.VIDEO_EDGE_TTL_SECONDS || 300),
    },
  };
};

export const createSignedPlaybackPlaceholder = ({ videoId, userId }) => ({
  tokenized: Boolean(process.env.STREAMING_SIGNING_SECRET),
  token: process.env.STREAMING_SIGNING_SECRET ? `signed-placeholder-${videoId}-${userId}` : "",
  expiresInSeconds: Number(process.env.STREAMING_TOKEN_TTL_SECONDS || 900),
});
