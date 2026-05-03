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

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });

  socket.on("getOnlineUsers", () => {
    io.emit("getOnlineUsers", [socket.id]);
  });
});

// ✅ Start server + connect DB
server.listen(port, async () => {
  await connectToDB();
  console.log(`🚀 Server running at port ${port}`);
  console.log(`✅ Allowed Origins:`, allowedOrigins);
});
