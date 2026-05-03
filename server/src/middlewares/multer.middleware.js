// import path from "path";

// import multer from "multer";

// const upload = multer({
//   dest: "uploads/",
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50 mb in size max limit
//   storage: multer.diskStorage({
//     destination: "uploads/",
//     filename: (_req, file, cb) => {
//       cb(null, file.originalname);
//     },
//   }),
//   fileFilter: (_req, file, cb) => {
//     let ext = path.extname(file.originalname);

//     if (
//       ext !== ".jpg" &&
//       ext !== ".jpeg" &&
//       ext !== ".webp" &&
//       ext !== ".png" &&
//       ext !== ".mp4" &&
//       ext !== ".xlsx" &&
//       ext !== ".xls" &&
//       ext !== ".xlsm" &&
//       ext !== ".csv" 
      
//     ) {
//       cb(new Error(`Unsupported file type! ${ext}`), false);
//       return;
//     }

//     cb(null, true);
//   },
// });

// export default upload;



/////////////////////////////////////////////////////////////////////////////

// import path from "path";
// import multer from "multer";
// import fs from "fs";

// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       const ext = path.extname(file.originalname).toLowerCase();

//       // For heavy media files -> save to disk
//       if ([".jpg", ".jpeg", ".webp", ".png", ".mp4"].includes(ext)) {
//         cb(null, "uploads/");
//       } else {
//         // For Excel/CSV -> keep in memory (fake folder, won't be used)
//         cb(null, "/dev/null");
//       }
//     },
//     filename: (_req, file, cb) => {
//       cb(null, file.originalname);
//     },
//   }),
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
//   fileFilter: (_req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (
//       ![".jpg", ".jpeg", ".webp", ".png", ".mp4", ".xlsx", ".xls", ".xlsm", ".csv"].includes(ext)
//     ) {
//       return cb(new Error(`Unsupported file type! ${ext}`), false);
//     }
//     cb(null, true);
//   },
// });

// // Monkey-patch to put Excel/CSV into memory buffer
// upload._handleFile = function _handleFile(req, file, cb) {
//    console.log("Multer file object:", req.file); // 👈 see what's coming
//     console.log("Multer body object:", req.body);
//   const ext = path.extname(file.originalname).toLowerCase();

//   if ([".xlsx", ".xls", ".xlsm", ".csv"].includes(ext)) {
//     // Collect chunks in memory
//     const chunks = [];
//     file.stream.on("data", (chunk) => chunks.push(chunk));
//     file.stream.on("end", () => {
//       file.buffer = Buffer.concat(chunks);
//       cb(null, {
//         buffer: file.buffer,
//         size: file.buffer.length,
//         originalname: file.originalname,
//         mimetype: file.mimetype,
//       });
//     });
//   } else {
//     // Fallback to disk storage for images/videos
//     multer.diskStorage({
//       destination: "uploads/",
//       filename: (_req, f, cb2) => cb2(null, f.originalname),
//     })._handleFile(req, file, cb);
//   }
// };

// export default upload;



////////////////////////////////////////////////////////////////

// import path from "path";
// import multer from "multer";
// import fs from "fs";

// const diskStorage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (_req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({
//   storage: {
//     _handleFile(req, file, cb) {
//       const ext = path.extname(file.originalname).toLowerCase();

//       if ([".xlsx", ".xls", ".xlsm", ".csv"].includes(ext)) {
//       // if ([".pdf"].includes(ext)) {

//         // 👉 Store Excel/CSV in memory
//         const chunks = [];
//         file.stream.on("data", (chunk) => chunks.push(chunk));
//         file.stream.on("end", () => {
//           const buffer = Buffer.concat(chunks);
//           cb(null, {
//             buffer,
//             size: buffer.length,
//             originalname: file.originalname,
//             mimetype: file.mimetype,
//           });
//         });
//       } else {
//         // 👉 Use diskStorage for everything else
//         diskStorage._handleFile(req, file, cb);
//       }
//     },

//     _removeFile(_req, file, cb) {
//       if (file.path) {
//         // clean up if it was written to disk
//         fs.unlink(file.path, cb);
//       } else {
//         cb(null);
//       }
//     },
//   },
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
//   fileFilter: (_req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (
//       ![".jpg", ".jpeg", ".webp", ".png", ".mp4", ".xlsx", ".xls", ".xlsm", ".csv"].includes(ext)
//     ) {
//       return cb(new Error(`Unsupported file type! ${ext}`), false);
//     }
//     cb(null, true);
//   },
// });

// export default upload;


/////////////////////////////////////////////////////////////////////////////////////////////

// import path from "path";
// import fs from "fs";
// import multer from "multer";

// const diskStorage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (_req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`); // unique filename
//   },
// });

// const upload = multer({
//   storage: {
//     _handleFile(req, file, cb) {
//       const ext = path.extname(file.originalname).toLowerCase();

//       // 👉 Store Excel/CSV/PDF in memory
//       if ([".xlsx", ".xls", ".xlsm", ".csv", ".pdf"].includes(ext)) {
//         const chunks = [];
//         file.stream.on("data", (chunk) => chunks.push(chunk));
//         file.stream.on("end", () => {
//           const buffer = Buffer.concat(chunks);
//           cb(null, {
//             buffer,
//             size: buffer.length,
//             originalname: file.originalname,
//             mimetype: file.mimetype,
//           });
//         });
//       } else {
//         // 👉 Use diskStorage for everything else
//         diskStorage._handleFile(req, file, cb);
//       }
//     },

//     _removeFile(_req, file, cb) {
//       if (file.path) {
//         fs.unlink(file.path, cb);
//       } else {
//         cb(null);
//       }
//     },
//   },
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
//   fileFilter: (_req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (
//       ![
//         ".jpg",
//         ".jpeg",
//         ".webp",
//         ".png",
//         ".mp4",
//         ".xlsx",
//         ".xls",
//         ".xlsm",
//         ".csv",
//         ".pdf",
//       ].includes(ext)
//     ) {
//       return cb(new Error(`Unsupported file type! ${ext}`), false);
//     }
//     cb(null, true);
//   },
// });

// export default upload;



import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(), // ✅ always gives buffer
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files allowed'), false);
    }
    cb(null, true);
  },
});

export default upload;


// import path from "path";
// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (_req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
//   fileFilter: (_req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (![".jpg", ".jpeg", ".webp", ".png", ".mp4", ".xlsx", ".xls", ".xlsm", ".csv"].includes(ext)) {
//       return cb(new Error(`Unsupported file type: ${ext}`), false);
//     }
//     cb(null, true);
//   },
// });

// export default upload;
