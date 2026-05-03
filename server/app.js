// import cookieParser from 'cookie-parser';
// config();
// import express from 'express';
// import { config } from 'dotenv';
// import cors from 'cors';
// import morgan from 'morgan';
// import errorMiddleware from './middlewares/error.middleware.js';
// import path from "path";
// import { fileURLToPath } from "url";
// // import { app, server } from "./utils/socket.js"


// // Import all routes
// import userRoutes from './routes/user.routes.js';
// import adminRoutes from './routes/admin.routes.js'
// import blogRoutes from './routes/blog.routes.js';
// import categoryRoutes from './routes/category.routes.js';
// import blogLikeRoute from './routes/like.routes.js';
// import contactRoute from './routes/contact.routes.js';
// import statsRoute from './routes/stats.routes.js';
// import excelRoutes from './routes/upload.routes.js';
// import summaryRoutes from './routes/summary.routes.js';
// import commentRoutes from './routes/comment.routes.js';
// // import messageRoutes from './routes/message.routes.js'


// // import miscRoutes from './routes/miscellaneous.routes.js';


// const app = express();

// // Middlewares
// // Built-In
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// // Third-Party
// app.use(
//   cors({
//     origin: [process.env.FRONTEND_URL],
//     credentials: true,
//   })
// );
// app.use(morgan('dev'));
// app.use(cookieParser());

// const _dirname = path.resolve();

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// app.get("/", (_req, res) => {
//   res.send("🚀 Blogging Platform API is running...");
// });




// // Server Status Check Route
// app.get('/ping', (_req, res) => {
//   res.send('Pong');
// });


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Serve frontend in production
// if (process.env.NODE_ENV === "production") {
//   const frontendPath = path.resolve(__dirname, "../client/dist");
//   app.use(express.static(frontendPath));

//   app.get("*", (_req, res) => {
//     res.sendFile(path.resolve(frontendPath, "index.html"));
//   });
// }



// app.use('/api/v1/user', userRoutes);
// app.use('/api/v1/admin', adminRoutes)
// app.use('/api/v1/posts', blogRoutes);
// // app.use("/api/v1/messages", messageRoutes);
// app.use('/api/v1/comment', commentRoutes);
// app.use('/api/v1/excel', excelRoutes);
// app.use('/api/v1/ai/summary', summaryRoutes);
// app.use('/api/v1/contact', contactRoute);
// app.use('/api/v1/stats', statsRoute);
// // app.use('/api/v1', miscRoutes);

// // app.use('/api/v1/blogLikes', BlogLikeRoute);
// app.use('/api/v1/category', categoryRoutes);
// app.use('/api/v1/likes', blogLikeRoute);


// // const path = require("path");

// app.use(express.static(path.join(__dirname, "../client/dist")));

// app.use( (_req, res) => {
//   res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
// });

// // ------------------- Fallbacks -------------------
// app.use((_req, res) => {
//   res.status(404).send("OOPS!!! 404 Page Not Found");
// });



// // Default catch all route - 404
// // app.use((_req, res) => {
// //   res.status(404).send('OOPS!!! 404 Page Not Found');
// // });

// // Custom error handling middleware
// app.use(errorMiddleware);

// // app.use(express.static(path.join(_dirname, "/client/build")));
// // app.get('*', (_,res) => {
// //   res.sendFile(path.resolve(_dirname, "client", "build", "index.html"));
// // });

// export default app;





// import cookieParser from 'cookie-parser';
// import express from 'express';
// import { config } from 'dotenv';
// import cors from 'cors';
// import morgan from 'morgan';
// import path from 'path';
// import errorMiddleware from './middlewares/error.middleware.js';

// // Import all routes
// import userRoutes from './routes/user.routes.js';
// import adminRoutes from './routes/admin.routes.js';
// import blogRoutes from './routes/blog.routes.js';
// import CategoryRoute from './routes/Category.routes.js';
// import contactRoute from './routes/contact.routes.js';
// import statsRoute from './routes/stats.routes.js';
// import excelRoutes from './routes/upload.routes.js';
// import summaryRoutes from './routes/summary.routes.js';

// import Affix from './models/affix.model.js'; // ✅ New: Post schema for realtime

// // Init env and express
// config();
// const app = express();

// // Middlewares
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(
//   cors({
//     origin: [process.env.FRONTEND_URL],
//     credentials: true,
//   })
// );
// app.use(morgan('dev'));
// app.use(cookieParser());

// const __dirname = path.resolve();

// // Server Status Check Route
// app.get('/ping', (_req, res) => {
//   res.send('Pong');
// });

// // Routes
// app.use('/api/v1/user', userRoutes);
// app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/posts', blogRoutes);
// app.use('/api/v1/excel', excelRoutes);
// app.use('/api/v1/ai/summary', summaryRoutes);
// app.use('/api/v1/contact', contactRoute);
// app.use('/api/v1/stats', statsRoute);
// app.use('/api/v1/category', CategoryRoute);

// // Default catch all route - 404
// app.use((_req, res) => {
//   res.status(404).send('OOPS!!! 404 Page Not Found');
// });

// // Custom error handling middleware
// app.use(errorMiddleware);

// // 🔥 Realtime with Socket.IO
// export const initRealtime = (server, io) => {
//   io.on('connection', async (socket) => {
//     console.log('Client connected:', socket.id);

//     // Utility: get a post or create one if none exists
//     const getAffix = async () => {
//       let affix = await Affix.findOne();
//       if (!affix) {
//         affix = await Affix.create({ title: 'Realtime Demo Post' });
//       }
//       return affix;
//     };

//     const affix = await getAffix();
//     socket.emit('updateStats', affix);

//     // Like
//     socket.on('likeAffix', async () => {
//       const affix = await getAffix();
//       affix.likes += 1;
//       await affix.save();
//       io.emit('updateStats', affix);
//     });

//     // View
//     socket.on('viewAffix', async () => {
//       const affix = await getAffix();
//       affix.views += 1;
//       await affix.save();
//       io.emit('updateStats', affix);
//     });

//     // Comment
//     socket.on('addComment', async (comment) => {
//       const affix = await getAffix();
//       affix.comments.push(comment);
//       await affix.save();
//       io.emit('updateStats', affix);
//     });

//     socket.on('disconnect', () => {
//       console.log('Client disconnected:', socket.id);
//     });
//   });
// };

// export default app;


// import express from 'express';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import morgan from 'morgan';
// import errorMiddleware from './middlewares/error.middleware.js';
// import blogRoutes from './routes/blog.routes.js';
// import userRoutes from './routes/user.routes.js';
// import adminRoutes from './routes/admin.routes.js';
// import CategoryRoute from './routes/Category.routes.js';
// import contactRoute from './routes/contact.routes.js';
// import statsRoute from './routes/stats.routes.js';
// import excelRoutes from './routes/upload.routes.js';
// import summaryRoutes from './routes/summary.routes.js';

// const app = express();

// // Middlewares
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({ origin: [process.env.FRONTEND_URL], credentials: true }));
// app.use(cookieParser());
// app.use(morgan('dev'));

// // Routes
// app.use('/api/v1/user', userRoutes);
// app.use('/api/v1/admin', adminRoutes);
// app.use('/api/v1/posts', blogRoutes);
// app.use('/api/v1/excel', excelRoutes);
// app.use('/api/v1/ai/summary', summaryRoutes);
// app.use('/api/v1/contact', contactRoute);
// app.use('/api/v1/stats', statsRoute);
// app.use('/api/v1/category', CategoryRoute);

// // Default 404
// app.use((_req, res) => res.status(404).send('OOPS!!! 404 Page Not Found'));

// // Error middleware
// app.use(errorMiddleware);

// // --------------------
// // Real-time setup
// // --------------------

// import Post from './models/blog.model.js';

// export const initRealtime = (server, io) => {
//   // const Blog = require('./models/blog.model.js'); // Make sure you have a blog model

//   io.on('connection', (socket) => {
//     console.log('🔌 User connected', socket.id);

//     // Handle likes
//     socket.on('likePost', async ({ postId }) => {
//       const post = await Post.findById(postId);
//       if (post) {
//         post.likes += 1;
//         await post.save();
//         io.emit('postUpdated', { postId, likes: post.likes }); // Broadcast to all clients
//       }
//     });

//     // Handle comments
//     socket.on('addComment', async ({ postId, comment }) => {
//       const post = await Post.findById(postId);
//       if (post) {
//         post.comments.push(comment);
//         await post.save();
//         io.emit('postUpdated', { postId, comments: post.comments });
//       }
//     });

//     // Handle views
//     socket.on('viewPost', async ({ postId }) => {
//       const post = await Post.findById(postId);
//       if (post) {
//         post.views += 1;
//         await post.save();
//         io.emit('postUpdated', { postId, views: post.views });
//       }
//     });

//     socket.on('disconnect', () => {
//       console.log('❌ User disconnected', socket.id);
//     });
//   });
// };

// export default app;






import cookieParser from "cookie-parser";
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import morgan from "morgan";
import errorMiddleware from "./src/middlewares/error.middleware.js";
import path from "path";
import { fileURLToPath } from "url";
import { corsOriginDelegate } from "./src/configs/cors.config.js";

// import session from "express-session";
import MongoStore from "connect-mongo";

// Init env
config();
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(
//   cors({
//     origin: [process.env.FRONTEND_URL],
//     credentials: true,
//   })
// );


if (process.env.NODE_ENV === "test") {
  console.log = () => {};
  console.warn = () => {};
}


app.set('trust proxy', 1);

app.use(
  cors({
    origin: corsOriginDelegate,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(morgan("dev"));
app.use(cookieParser());

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       sameSite: "none", // VERY IMPORTANT if frontend and backend are on different domains
//       secure: true,     // true if using HTTPS, false if local
//     },
//   })
// );


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // your MongoDB connection string
      collectionName: "sessions",
    }),
    cookie: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);


// File path setup (ESM-safe __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Health check routes
app.get("/", (_req, res) => res.send("🚀 Xlblog API is running..."));
app.get("/ping", (_req, res) => res.send("Pong"));

// ---------------- API Routes ----------------
import userRoutes from "./src/routes/user.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import adminDynamicRoutes from './src/routes/admin.dynamic.routes.js';
import blogRoutes from "./src/routes/blog.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import blogLikeRoute from "./src/routes/like.routes.js";
import contactRoute from "./src/routes/contact.routes.js";
import statsRoute from "./src/routes/stats.routes.js";
import excelRoutes from "./src/routes/upload.routes.js";
import summaryRoutes from "./src/routes/summary.routes.js";
import commentRoutes from "./src/routes/comment.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import testRoutes from "./src/routes/test.routes.js";
import session from "express-session";

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use('/api/v1/admin', adminDynamicRoutes);
app.use("/api/v1/posts", blogRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/excel", excelRoutes);
app.use("/api/v1/ai/summary", summaryRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use("/api/v1/contact", contactRoute);
app.use("/api/v1/stats", statsRoute);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/likes", blogLikeRoute);
app.use("/api/v1/tests", testRoutes);

// ---------------- Frontend (Production) ----------------
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "../client/dist");
  app.use(express.static(frontendPath));

  // Serve React/Vite index.html for any other route
  app.get((_req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ---------------- Error Handling ----------------
app.use(errorMiddleware);

app.use((_req, res) => {
  res.status(404).send("OOPS!!! 404 Page Not Found");
});

export default app;
