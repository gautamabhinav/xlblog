// // import * as uploadService from "../services/upload.service.js";

// import asyncHandler from "../middlewares/asyncHandler.middleware.js";
// import * as  uploadService from "../services/upload.service.js"
// import AppError from "../utils/AppError.js";
// import cloudinary from "cloudinary"

// /**
//  * Upload Excel File
//  */
// export const uploadExcelFile = asyncHandler(async (req, res, next) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   try {
//     const result = await cloudinary.v2.uploader.upload(req.file.path, {
//       folder: "excel",
//       resource_type: "raw", // for Excel, CSV, PDF, etc.
//     });

//     // Optional: clean up local file
//     fs.rm(`uploads/${req.file.filename}`, () => {});

//     return res.status(201).json({
//       message: "File uploaded successfully",
//       public_id: result.public_id,
//       url: result.secure_url,
//     });
//   } catch (error) {
//     return next(new AppError(error.message || "File not uploaded", 400));
//   }
// });

// /**
//  * Get all Excel files (metadata only)
//  */
// export const getAllExcelFiles = asyncHandler(async(req, res, next) =>  {
//   const files = await uploadService.listExcelFiles();
//   res.json(files);
// })

// /**
//  * Get single Excel file
//  */
// export const getExcelFileById = asyncHandler(async(req, res, next) => {
//   const file = await uploadService.getExcelFile(req.params.id);
//   if (!file) return res.status(404).json({ message: "File not found" });
//   res.json(file);
// })

// /**
//  * Delete Excel file
//  */
// export const deleteExcelFileById = asyncHandler(async(req, res, next) => {
//   const deleted = await uploadService.deleteExcelFile(req.params.id);
//   if (!deleted) return res.status(404).json({ message: "File not found" });
//   res.json({ message: "File deleted successfully" });
// })


////////////////////////////////////////////////////////////////////////////////////



// import ExcelFile from "../models/ExcelFile.js";
// import XLSX from "xlsx";

// // Upload Excel file
// export const uploadExcel = async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) return res.status(400).json({ message: "No file uploaded" });

//     // Parse Excel file
//     const workbook = XLSX.read(file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });

//     // Convert to array of { fields: Map }
//     const rows = jsonData.map((row) => ({ fields: row }));

//     const excelFile = new ExcelFile({
//       filename: file.originalname,
//       contentType: file.mimetype,
//       size: file.size,
//       data: rows,
//       uploadedBy: req.user?._id,
//     });

//     await excelFile.save();

//     res.status(201).json({ message: "File uploaded successfully", ...excelFile.toObject() });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get all Excel files metadata
// export const getAllExcelFiles = async (req, res) => {
//   try {
//     const files = await ExcelFile.find()
//       .select("-data")
//       .sort({ uploadedAt: -1 });
//     res.json(files);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get a single Excel file by ID
// export const getExcelFileById = async (req, res) => {
//   try {
//     const file = await ExcelFile.findById(req.params.id);
//     if (!file) return res.status(404).json({ message: "File not found" });
//     res.json(file);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Delete an Excel file by ID
// export const deleteExcelFileById = async (req, res) => {
//   try {
//     const file = await ExcelFile.findByIdAndDelete(req.params.id);
//     if (!file) return res.status(404).json({ message: "File not found" });
//     res.json({ message: "File deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import ExcelFile from "../models/excel.model.js";
import * as XLSX from "xlsx";

// Upload Excel file
// export const uploadExcel = asyncHandler(async (req, res) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ success: false, message: "No file uploaded" });
//   }

//   // Parse Excel file
//   const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//   const sheetName = workbook.SheetNames[0];
//   const sheet = workbook.Sheets[sheetName];
//   const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });

//   // Convert to array of { fields: Map }
  
//   const rows = jsonData.map((row) => ({ fields: row }));

//   const excelFile = new ExcelFile({
//     filename: file.originalname,
//     contentType: file.mimetype,
//     size: file.size,
//     data: rows,
//     uploadedBy: req.user?._id,
//   });

//   await excelFile.save();

//   res.status(201).json({
//     success: true,
//     message: "Excel file uploaded successfully",
//     file: excelFile,
//   });
// });

export const uploadExcel = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Parse Excel file
  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });

  // Convert to array of { fields: Map }
  
  const rows = jsonData.map((row) => ({ fields: row }));

  const excelFile = new ExcelFile({
    filename: file.originalname,
    contentType: file.mimetype,
    size: file.size,
    data: rows,
    uploadedBy: req.user?._id,
  });

  await excelFile.save();

  res.status(201).json({
    success: true,
    message: "Excel file uploaded successfully",
    fileUrl: file.fileUrl,
    fileType: file.fileType,
    originalName: file.originalname,
    file: excelFile,
  });


  // const file = req.file;
  // if (!file) {
  //   return res.status(400).json({ success: false, message: "No file uploaded" });
  // }

  // try {
  //   // Parse Excel file
  //   const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

  //   if (!workbook.SheetNames.length) {
  //     return res.status(400).json({ success: false, message: "Excel file is empty" });
  //   }

  //     // Convert all sheets to JSON
  //     const sheets = workbook.SheetNames.map((name) => {
  //     const sheet = workbook.Sheets[name];
  //     const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });
  //     return { name, rows: jsonData };
  //   });

  //   // Store first sheet rows separately for quick frontend access
  //   const data = sheets[0]?.rows || [];

  //   // Save file with metadata
  //   const excelFile = new ExcelFile({
  //     filename: file.originalname,
  //     contentType: file.mimetype,
  //     size: file.size,
  //     sheets,           // full sheets
  //     data,             // first sheet rows
  //     uploadedBy: req.user?._id,
  //     uploadedAt: new Date(), // track upload time for history
  //   });

  //   await excelFile.save();

  //   res.status(201).json({
  //     success: true,
  //     message: "Excel file uploaded successfully",
  //     file: excelFile,
  //   });
  // } catch (err) {
  //   console.error("Error uploading Excel file:", err);
  //   res.status(500).json({ success: false, message: "Failed to upload Excel file" });
  // }
});


// export const uploadExcel = asyncHandler(async (req, res) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ success: false, message: "No file uploaded" });
//   }

//   const workbook = XLSX.read(file.buffer, { type: "buffer" });

//   const sheets = workbook.SheetNames.map((name) => {
//     const sheet = workbook.Sheets[name];
//     const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });
//     return { name, rows: jsonData };
//   });

//   // Save first sheet as `data` for frontend convenience
//   const data = sheets[0]?.rows || [];

//   const excelFile = new ExcelFile({
//     filename: file.originalname,
//     contentType: file.mimetype,
//     size: file.size,
//     sheets, // all sheets
//     data,   // first sheet rows
//     uploadedBy: req.user?._id,
//   });

//   await excelFile.save();

//   res.status(201).json({
//     success: true,
//     message: "Excel file uploaded successfully",
//     file: excelFile,
//   });
// });

// export const uploadExcel = asyncHandler(async (req, res) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ success: false, message: "No file uploaded" });
//   }

//   // Parse Excel (all sheets, sample 200 rows each)
//   const workbook = XLSX.read(file.buffer, { type: "buffer" });
//   const sheets = workbook.SheetNames.map((name) => {
//     const sheet = workbook.Sheets[name];
//     const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });
//     // return { name, rows: jsonData.slice(0, 200) }; // limit to 200 rows
//     return { name, rows: jsonData }; // limit to 200 rows

//   });

//   const excelFile = new ExcelFile({
//     filename: file.originalname,
//     contentType: file.mimetype,
//     size: file.size,
//     sheets,
//     uploadedBy: req.user?._id,
//   });

//   await excelFile.save();

//   res.status(201).json({
//     success: true,
//     message: "Excel file uploaded successfully",
//     file: excelFile,
//   });
// });



// export const uploadExcel = asyncHandler(async (req, res) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ success: false, message: "No file uploaded" });
//   }

//   try {
//     // Parse Excel file
//     const workbook = XLSX.read(file.buffer, { type: "buffer" });

//     if (!workbook.SheetNames.length) {
//       return res.status(400).json({ success: false, message: "Excel file is empty" });
//     }

//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];

//     // Convert sheet to JSON
//     const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

//     if (!jsonData.length) {
//       return res.status(400).json({ success: false, message: "No data in Excel sheet" });
//     }

//     // Convert to array of { fields: Map }
//     const rows = jsonData.map((row) => ({ fields: row }));

//     const excelFile = new ExcelFile({
//       filename: file.originalname,
//       contentType: file.mimetype,
//       size: file.size,
//       data: rows,
//       uploadedBy: req.user?._id,
//     });

//     await excelFile.save();

//     res.status(201).json({
//       success: true,
//       message: "Excel file uploaded successfully",
//       file: excelFile,
//     });
//   } catch (err) {
//     console.error("Error uploading Excel file:", err);
//     res.status(500).json({ success: false, message: "Failed to upload Excel file" });
//   }
// });

// Get all Excel files (metadata only)



// Get all Excel files (metadata only)


export const getAllExcelFiles = asyncHandler(async (req, res) => {
  // const files = await ExcelFile.find({}).select("-sheets").sort({ uploadedAt: -1 });

  // res.status(200).json({
  //   success: true,
  //   message: "All Excel files fetched successfully",
  //   files,
  // });


  // Fetch metadata for history view
  const files = await ExcelFile.find({})
    .select("filename uploadedBy uploadedAt size contentType") // only metadata
    .sort({ uploadedAt: -1 });

  res.status(200).json({
    success: true,
    message: "All Excel files fetched successfully",
    files,
  });
});


// Get a single Excel file by ID
// Get a single Excel file by ID
export const getExcelFileById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const file = await ExcelFile.findById(id);

  if (!file) {
    return res.status(404).json({ success: false, message: "Excel file not found" });
  }

  res.status(200).json({
    success: true,
    message: "Excel file fetched successfully",
    file,
  });
});


// Delete Excel file
export const deleteExcelFileById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const file = await ExcelFile.findByIdAndDelete(id);

  if (!file) {
    return res.status(404).json({ success: false, message: "Excel file not found" });
  }

  res.status(200).json({
    success: true,
    message: "Excel file deleted successfully",
  });
});
