// import { v2 } from 'cloudinary';


// import app from './app.js';
// import connectToDB from './configs/dbConn.js';

// const port = process.env.PORT || 10000;

// import path from "path";


// const _dirname = path.resolve();

// Cloudinary configuration
// v2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });


// Create an order
// export const options = {
//   amount: 10000,  // Amount in paise (₹100.00)
//   currency: 'INR',
//   receipt: 'order_rcptid_11'
// };

// const PORT = process.env.PORT || 5000;

// // Serve static files from the 'dist' directory
// app.use(express.static(path.join(__dirname, "build")));

// // Serve index.html for any route (SPA support)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

// app.listen(port, async () => {
//   // Connect to DB
//   await connectToDB();
//   console.log(`App is running at http://localhost:${port}`);
// });



// import { v2 as cloudinary } from "cloudinary";
// import http from "http";
// import { Server } from "socket.io";

// import app from "./app.js";
// import connectToDB from "./src/configs/dbConn.js";

// const port = process.env.PORT || 10000;

// // ✅ Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ✅ Create HTTP server (Express wrapped)
// const server = http.createServer(app);

// // ✅ Attach Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || "http://localhost:5173", // frontend dev URL
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // ✅ Socket.IO handlers
// io.on("connection", (socket) => {
//   console.log("✅ User connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("❌ User disconnected:", socket.id);
//   });

//   // Example: emit online users
//   socket.on("getOnlineUsers", () => {
//     io.emit("getOnlineUsers", [socket.id]); // broadcast
//   });
// });

// // ✅ Start server + connect DB
// server.listen(port, async () => {
//   await connectToDB();
//   console.log(`🚀 Server running at http://localhost:${port}`);
// });



import { v2 as cloudinary } from "cloudinary";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectToDB from "./src/configs/dbConn.js";
import { allowedOrigins, corsOriginDelegate } from "./src/configs/cors.config.js";

const port = process.env.PORT || 10000;

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Create HTTP server (Express wrapped)
const server = http.createServer(app);

// ✅ Attach Socket.IO with flexible CORS
const io = new Server(server, {
  cors: {
    origin: corsOriginDelegate,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Socket.IO handlers
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("presence:join", ({ userId, room = "global" } = {}) => {
    socket.join(`presence:${room}`);
    socket.to(`presence:${room}`).emit("presence:online", { userId, socketId: socket.id, room });
  });

  socket.on("classroom:join", ({ classroomId } = {}) => {
    if (!classroomId) return;
    socket.join(`classroom:${classroomId}`);
    socket.to(`classroom:${classroomId}`).emit("classroom:user-joined", { socketId: socket.id });
  });

  socket.on("quiz:join", ({ quizId } = {}) => {
    if (quizId) socket.join(`quiz:${quizId}`);
  });

  socket.on("quiz:update", ({ quizId, payload } = {}) => {
    if (!quizId) return;
    io.to(`quiz:${quizId}`).emit("quiz:update", payload);
  });

  socket.on("typing", ({ room = "global", userId, isTyping = true } = {}) => {
    socket.to(`presence:${room}`).emit("typing", { userId, isTyping });
  });

  socket.on("live:reaction", ({ classroomId, reaction } = {}) => {
    if (!classroomId) return;
    socket.to(`classroom:${classroomId}`).emit("live:reaction", { reaction, socketId: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });

  socket.on("getOnlineUsers", () => {
    io.emit("getOnlineUsers", [socket.id]);
  });
});

// ✅ Start server + connect DB with port retry on EADDRINUSE
const MAX_PORT_RETRIES = 10;

async function startServer(startPort, attemptsLeft = MAX_PORT_RETRIES) {
  try {
    server.listen(startPort, async () => {
      await connectToDB();
      console.log(`🚀 Server running at port ${startPort}`);
      console.log(`✅ Allowed Origins:`, allowedOrigins);
    });
    server.on('error', async (err) => {
      if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        console.warn(`Port ${startPort} in use, trying ${startPort + 1}...`);
        // remove listeners before retrying
        server.removeAllListeners('error');
        await startServer(startPort + 1, attemptsLeft - 1);
      } else {
        console.error('Server failed to start:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

startServer(Number(port));
