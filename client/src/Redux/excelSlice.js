// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axiosInstance from "../Helper/axiosInstance";
// import { toast } from "react-hot-toast";



// const initialState =  {
//     files: [], // list of files metadata
//     currentFile: null, // details of one file
//     status: "idle", // idle | loading | succeeded | failed
//     error: null,
//   }
// //
// // ------------------- Async Thunks -------------------
// //

// // Upload Excel file
// // export const uploadExcelFile = createAsyncThunk(
// //   "excel/upload",
// //   async (file, { rejectWithValue }) => {
// //     try {
// //       const formData = new FormData();
// //       formData.append("excel", file);

// //       const resPromise = axiosInstance.post("/excel", formData, {
// //         headers: { "Content-Type": "multipart/form-data" },
// //       });

// //       await toast.promise(resPromise, {
// //         loading: "Uploading file...",
// //         success: (res) => res?.data?.message || "File uploaded successfully",
// //         error: "Upload failed",
// //       });

// //       const res = await resPromise;
// //       return res.data;
// //     } catch (err) {
// //       const message = err?.response?.data?.message || err.message;
// //       toast.error(message);
// //       return rejectWithValue(message);
// //     }
// //   }
// // );

// export const uploadExcelFile = createAsyncThunk(
//   "excel/upload",
//   async (file, { rejectWithValue }) => {
//     try {
//       const formData = new FormData();
//       formData.append("excel", file); // 👈 must match field name in multer

//       const resPromise = axiosInstance.post("/excel", formData);

//       await toast.promise(resPromise, {
//         loading: "Uploading file...",
//         success: (res) => res?.data?.message || "File uploaded successfully",
//         error: "Upload failed",
//       });

//       const res = await resPromise;
//       return res.data;
//     } catch (err) {
//       const message = err?.response?.data?.message || err.message;
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );


// // Get all Excel files (metadata only)
// export const getExcelFiles = createAsyncThunk(
//   "excel/getAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get("/excel");
//       return res.data;
//     } catch (err) {
//       const message = err?.response?.data?.message || err.message;
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );

// // Get a single Excel file by ID
// export const getExcelFileById = createAsyncThunk(
//   "excel/getById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/excel/${id}`);
//       return res.data;
//     } catch (err) {
//       const message = err?.response?.data?.message || err.message;
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );

// // Delete Excel file
// export const deleteExcelFile = createAsyncThunk(
//   "excel/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       const resPromise = axiosInstance.delete(`/excel/${id}`);

//       await toast.promise(resPromise, {
//         loading: "Deleting...",
//         success: "File deleted successfully",
//         error: "Failed to delete file",
//       });

//       const res = await resPromise;
//       return { id, message: res?.data?.message };
//     } catch (err) {
//       const message = err?.response?.data?.message || err.message;
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );

// //
// // ------------------- Slice -------------------
// //
// const excelSlice = createSlice({
//   name: "excel",
//   initialState ,
//   reducers: {
//     clearCurrentFile(state) {
//       state.currentFile = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Upload
//       .addCase(uploadExcelFile.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(uploadExcelFile.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.files.push(action.payload); // add new file metadata
//       })
//       .addCase(uploadExcelFile.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       })

//       // Get all files
//       .addCase(getExcelFiles.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(getExcelFiles.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.files = action.payload;
//       })
//       .addCase(getExcelFiles.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       })

//       // Get one file
//       .addCase(getExcelFileById.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(getExcelFileById.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.currentFile = action.payload;
//       })
//       .addCase(getExcelFileById.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       })

//       // Delete
//       .addCase(deleteExcelFile.fulfilled, (state, action) => {
//         state.files = state.files.filter((f) => f._id !== action.payload.id);
//       });
//   },
// });

// export const { clearCurrentFile } = excelSlice.actions;
// export default excelSlice.reducer;


// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axiosInstance from "../Helper/axiosInstance";
// import { toast } from "react-hot-toast";

// const initialState = {
//   files: [],
//   currentFile: null,
//   status: "idle", // idle | loading | succeeded | failed
//   error: null,
// };

// // Upload Excel file
// export const uploadExcelFile = createAsyncThunk(
//   "excel/upload",
//   async (file, { rejectWithValue }) => {
//     try {
//       const formData = new FormData();
//       formData.append("excel", file); // must match field name in multer

//       const resPromise = axiosInstance.post("/excel", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       await toast.promise(resPromise, {
//         loading: "Uploading file...",
//         success: (res) => res?.data?.message || "File uploaded successfully",
//         error: "Upload failed",
//       });

//       const res = await resPromise;
//       return res.data; // file metadata
//     } catch (err) {
//       const message = err?.response?.data?.message || err.message;
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );

// // Get all Excel files
// export const getExcelFiles = createAsyncThunk(
//   "excel/getAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get("/excel");
//       return res.data; // array of files
//     } catch (err) {
//       const message = err?.response?.data?.message || err.message;
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );

// // Get a single Excel file by ID
// export const getExcelFileById = createAsyncThunk(
//   "excel/getById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await axiosInstance.get(`/excel/${id}`);
//       return res.data; // { filename, data, ... }
//     } catch (err) {
//       const message = err?.response?.data?.message || err.message;
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );

// // Delete Excel file
// export const deleteExcelFile = createAsyncThunk(
//   "excel/delete",
//   async (id, { rejectWithValue }) => {
//     try {
//       const resPromise = axiosInstance.delete(`/excel/${id}`);
//       await toast.promise(resPromise, {
//         loading: "Deleting...",
//         success: "File deleted successfully",
//         error: "Failed to delete file",
//       });
//       const res = await resPromise;
//       return { id, message: res?.data?.message };
//     } catch (err) {
//       const message = err?.response?.data?.message || err.message;
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );

// const excelSlice = createSlice({
//   name: "excel",
//   initialState,
//   reducers: {
//     clearCurrentFile(state) {
//       state.currentFile = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Upload
//       .addCase(uploadExcelFile.pending, (state) => {
//         state.status = "loading";
//         state.error = null;
//       })
//       .addCase(uploadExcelFile.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.files.push(action.payload);
//       })
//       .addCase(uploadExcelFile.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       })

//       // Get all files
//       .addCase(getExcelFiles.pending, (state) => {
//         state.status = "loading";
//         state.error = null;
//       })
//       .addCase(getExcelFiles.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.files = action.payload;
//       })
//       .addCase(getExcelFiles.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       })

//       // Get single file
//       .addCase(getExcelFileById.pending, (state) => {
//         state.status = "loading";
//         state.error = null;
//       })
//       .addCase(getExcelFileById.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.currentFile = action.payload;
//       })
//       .addCase(getExcelFileById.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       })

//       // Delete
//       .addCase(deleteExcelFile.fulfilled, (state, action) => {
//         state.files = state.files.filter((f) => f._id !== action.payload.id);
//         if (state.currentFile?._id === action.payload.id) {
//           state.currentFile = null;
//         }
//       })
//       .addCase(deleteExcelFile.rejected, (state, action) => {
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearCurrentFile } = excelSlice.actions;
// export default excelSlice.reducer;



import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../Helper/axiosInstance";
import { toast } from "react-hot-toast";


const initialState = {
  files: [],
  currentFile: null,
  status: {
    upload: "idle",
    fetchAll: "idle",
    fetchSingle: "idle",
    delete: "idle",
  },
  error: {
    upload: null,
    fetchAll: null,
    fetchSingle: null,
    delete: null,
  },
};

// Upload Excel file
export const uploadExcelFile = createAsyncThunk(
  "excel/upload",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("excel", file);

      const resPromise = axiosInstance.post("/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      await toast.promise(resPromise, {
        loading: "Uploading file...",
        success: (res) => res?.data?.message || "File uploaded successfully",
        error: "Upload failed",
      });

      const res = await resPromise;
      return res.data; // backend must return { file: {...} }
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get all Excel files
export const getExcelFiles = createAsyncThunk(
  "excel/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/excel", {
        withCredentials: true
      });
      return Array.isArray(res.data.files) ? res.data.files : []; // ensure array
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);



// Get single Excel file by ID
export const getExcelFileById = createAsyncThunk(
  "excel/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/excel/${id}`,{
        withCredentials: true
      });
      return res.data.file;
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete Excel file
export const deleteExcelFile = createAsyncThunk(
  "excel/delete",
  async (id, { rejectWithValue }) => {
    try {
      const resPromise = axiosInstance.delete(`/excel/${id}`, {
        withCredentials: true
      });
      await toast.promise(resPromise, {
        loading: "Deleting...",
        success: "File deleted successfully",
        error: "Failed to delete file",
      });
      const res = await resPromise;
      return { id, message: res?.data?.message };
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);


const excelSlice = createSlice({
  name: "excel",
  initialState,
  reducers: {
    clearCurrentFile(state) {
      state.currentFile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload
      .addCase(uploadExcelFile.pending, (state) => {
        state.status.upload = "loading";
        state.error.upload = null;
      })
      .addCase(uploadExcelFile.fulfilled, (state, action) => {
        state.status.upload = "succeeded";
        state.error.upload = null;

        const file = action.payload.file || action.payload;
        if (!state.files.find(f => f._id === file._id)) {
          // state.files.push(file);
          state.files.unshift(file);
          //  console.log(state);
        }
      })
      .addCase(uploadExcelFile.rejected, (state, action) => {
        state.status.upload = "failed";
        state.error.upload = action.payload;
      })

      // Get all files
      .addCase(getExcelFiles.pending, (state) => {
        state.status.fetchAll = "loading";
        state.error.fetchAll = null;
      })
      .addCase(getExcelFiles.fulfilled, (state, action) => {
        state.status.fetchAll = "succeeded";
        state.error.fetchAll = null;
        state.files = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getExcelFiles.rejected, (state, action) => {
        state.status.fetchAll = "failed";
        state.error.fetchAll = action.payload;
      })

      // Get single file
      .addCase(getExcelFileById.pending, (state) => {
        state.status.fetchSingle = "loading";
        state.error.fetchSingle = null;
      })
      .addCase(getExcelFileById.fulfilled, (state, action) => {
        state.status.fetchSingle = "succeeded";
        state.error.fetchSingle = null;
        // action.payload may be the file object or an object containing { file }
        const file = action.payload?.file || action.payload;
        state.currentFile = file || null;
      })
      .addCase(getExcelFileById.rejected, (state, action) => {
        state.status.fetchSingle = "failed";
        state.error.fetchSingle = action.payload;
      })

      // Delete
      // .addCase(deleteExcelFile.fulfilled, (state, action) => {
      //   state.files = state.files.filter(f => f._id !== action.payload.id);
      //   if (state.currentFile?._id === action.payload.id) {
      //     state.currentFile = null;
      //   }
      // })
      // .addCase(deleteExcelFile.rejected, (state, action) => {
      //   state.error.delete = action.payload;
      // });
  },
});


export const { clearCurrentFile } = excelSlice.actions;
export default excelSlice.reducer;
// export const { clearCurrentFile } = excelSlice.actions;
// export default excelSlice.reducer;
