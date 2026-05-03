// // import mongoose from "mongoose";

// import { model, Schema } from "mongoose";


// // const excelFileSchema = new mongoose.Schema({
// //   filename: String,
// //   data: Object, // You can store JSON representation of Excel
// //   uploadedAt: { type: Date, default: Date.now }
// // });

// // const ExcelFile = mongoose.model("ExcelFile", excelFileSchema);

// // export default ExcelFile;


// const excelFileSchema = new Schema({
//   filename: String,
//   data: Object, // You can store JSON representation of Excel
//   uploadedAt: { type: Date, default: Date.now }
// })

// const ExcelFile = model('Excel', excelFileSchema);
// export default ExcelFile;




////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { Schema, model } from "mongoose";

/**
 * Row schema for structured Excel data.
 * If your Excel structure is dynamic, use Map<String, Mixed> instead.
 */
const excelRowSchema = new Schema(
  {
    // Example: replace with known column names OR use dynamic map
    fields: {
      type: Map,
      of: Schema.Types.Mixed, // allows flexible key/value pairs
      required: true,
    },
  },
  { _id: false }
);


// const ExcelFile = new mongoose.Schema({
//   filename: String,
//   data: Buffer,
//   mimetype: String,
//   uploadedAt: { type: Date, default: Date.now },
// });
/**
 * Excel file schema for metadata + data reference.
 */
const excelFileSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
      index: true, // optimize lookup by filename
    },
    contentType: {
      type: String,
      enum: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/vnd.ms-excel.sheet.macroEnabled.12",
        "text/csv",
        "application/csv",
      ],
      required: true,
    },
    size: {
      type: Number, // size in bytes
      required: true,
      min: 1,
    },
    rowCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    data: {
      type: [excelRowSchema], // scalable row storage
      default: [],
    },
    mimetype: {
      type: String
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // track uploader if auth exists
      index: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1, // for file re-uploads
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
    strict: true, // block unknown fields
    minimize: true, // remove empty objects
  }
);

// Compound index for faster queries
excelFileSchema.index({ uploadedBy: 1, uploadedAt: -1 });

/**
 * Pre-save middleware to update rowCount automatically
 */
excelFileSchema.pre("save", function (next) {
  if (Array.isArray(this.data)) {
    this.rowCount = this.data.length;
  }
  next();
});

const ExcelFile = model("ExcelFile", excelFileSchema);

export default ExcelFile;
