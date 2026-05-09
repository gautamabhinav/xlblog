const memoryQueue = [];

export const enqueueJob = async (name, payload = {}, options = {}) => {
  const job = {
    id: `${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    payload,
    options,
    status: "queued",
    createdAt: new Date(),
  };

  memoryQueue.push(job);
  return job;
};

export const getQueueSnapshot = () => ({
  driver: process.env.BULLMQ_REDIS_URL ? "bullmq-ready" : "memory-placeholder",
  pending: memoryQueue.length,
  jobs: memoryQueue.slice(-25).reverse(),
});

export const queueArchitecture = {
  videoTranscoding: "FFmpeg/BullMQ workers consume video.transcode jobs and publish ready assets.",
  aiProcessing: "AI transcript, summary, moderation, and recommendation jobs run asynchronously.",
  notifications: "Fan-out events can move from Socket.IO in-process to Redis adapter/Kafka.",
};
