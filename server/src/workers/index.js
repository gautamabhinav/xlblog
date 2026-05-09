import { config } from "dotenv";
import connectToDB from "../configs/dbConn.js";
import { getQueueSnapshot, queueArchitecture } from "../services/platform/queue.service.js";

config();

await connectToDB();

console.log("XL worker process booted");
console.log("Queue driver:", getQueueSnapshot().driver);
console.log("Worker contracts:", queueArchitecture);

setInterval(() => {
  const snapshot = getQueueSnapshot();
  if (snapshot.pending > 0) {
    console.log("Pending placeholder jobs:", snapshot.pending);
  }
}, 30000);
