// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { toast } from "react-hot-toast";
// import axiosInstance from "../Helper/axiosInstance";

// const initialState = {
//   lectures: [],
// };

// const uploadFile = async (file) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   const res = await axiosInstance.post("/upload", formData);
//   return res.data; // {secure_url, public_id}
// };

// const fileData = await uploadFile(data.lecture);

// const payload = {
//   title: data.title,
//   description: data.description,
//   lecture: {
//     secure_url: fileData.secure_url,
//     public_id: fileData.public_id,
//   },
// };

// const res = axiosInstance.post(`/courses/${data.id}`, payload);

// // function to get all the lectures
// export const getCourseLecture = createAsyncThunk(
//   "/course/lecture/get",
//   async (courseId) => {
//     try {
//       const res = axiosInstance.get(`/courses/${courseId}`);

//       toast.promise(res, {
//         loading: "Fetching the lectures...",
//         success: "Lectures fetched successfully",
//         error: "Failed to fetch lectures",
//       });

//       const response = await res;
//       return response.data;
//     } catch (error) {
//       toast.error(error?.response?.data?.message);
//     }
//   }
// );

// // function to add new lecture to the course
// export const addCourseLecture = createAsyncThunk(
//   "/course/lecture/add",
//   async (data, { rejectWithValue }) => {
//     try {
//       const fileData = await uploadFile(data.lecture);

//       const payload = {
//         title: data.title,
//         description: data.description,
//         lecture: fileData,
//       };

//       const res = await axiosInstance.post(`/courses/${data.id}`, payload);

//       return res.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // function to delete the lecture from the course
// export const deleteCourseLecture = createAsyncThunk(
//   "/course/lecture/delete",
//   async (data) => {
//     console.log(data);
//     try {
//       const res = axiosInstance.delete(
//         `/courses/?courseId=${data.courseId}&lectureId=${data.lectureId}`
//       );

//       toast.promise(res, {
//         loading: "Deleting the lecture...",
//         success: "Lecture deleted successfully",
//         error: "Failed to delete lecture",
//       });

//       const response = await res;
//       return response.data;
//     } catch (error) {
//       toast.error(error?.response?.data?.message);
//     }
//   }
// );

// const lectureSlice = createSlice({
//   name: "lecture",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(getCourseLecture.fulfilled, (state, action) => {
//         state.lectures = action?.payload?.lectures;
//       })
//       .addCase(addCourseLecture.fulfilled, (state, action) => {
//         state.lectures = action?.payload?.course?.lectures;
//       });
//   },
// });

// export const {} = lectureSlice.actions;
// export default lectureSlice.reducer;





// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { toast } from "react-hot-toast";
// import axiosInstance from "../Helper/axiosInstance";

// const initialState = {
//   lectures: [],
//   loading: false,
// };

// // -------------------------------
// // GET ALL LECTURES
// // -------------------------------
// export const getCourseLecture = createAsyncThunk(
//   "course/lecture/get",
//   async (courseId, { rejectWithValue }) => {
//     try {
//       const res = axiosInstance.get(`/courses/${courseId}`);

//       toast.promise(res, {
//         loading: "Fetching lectures...",
//         success: "Lectures fetched",
//         error: "Failed to fetch lectures",
//       });

//       const response = await res;
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error?.response?.data?.message);
//     }
//   }
// );

// // -------------------------------
// // UPLOAD FILE FIRST (IMPORTANT FIX)
// // -------------------------------
// const uploadLectureFile = async (file) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   const resPromise = axiosInstance.post("/files/single", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });

//   toast.promise(resPromise, {
//     loading: "Uploading file...",
//     success: "File uploaded successfully",
//     error: "File upload failed",
//   });

//   const res = await resPromise;
//   return res.data;
// };

// // -------------------------------
// // ADD LECTURE (FIXED)
// // -------------------------------
// export const addCourseLecture = createAsyncThunk(
//   "course/lecture/add",
//   async (data, { rejectWithValue }) => {
//     try {
//       let lectureData = data.lecture;

//       // ✅ If file is passed → upload first
//       if (lectureData instanceof File) {
//         const uploaded = await uploadLectureFile(lectureData);
//         lectureData = {
//           secure_url: uploaded.secure_url,
//           public_id: uploaded.public_id,
//         };
//       }

//       // ❌ Prevent empty lecture
//       if (!lectureData?.secure_url || !lectureData?.public_id) {
//         throw new Error("Lecture file missing or invalid");
//       }

//       const payload = {
//         title: data.title,
//         description: data.description,
//         lecture: lectureData,
//       };

//       console.log("Add Lecture Payload:", payload);

//       const res = axiosInstance.post(
//         `/courses/${data.id}`,
//         payload
//       );

//       console.log("Add Lecture Response:", res);

//       toast.promise(res, {
//         loading: "Adding lecture...",
//         success: "Lecture added successfully",
//         error: "Failed to add lecture",
//       });

//       const response = await res;
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error?.message || "Lecture upload failed");
//     }
//   }
// );

// // -------------------------------
// // DELETE LECTURE
// // -------------------------------
// export const deleteCourseLecture = createAsyncThunk(
//   "course/lecture/delete",
//   async (data, { rejectWithValue }) => {
//     try {
//       const res = axiosInstance.delete(
//         `/courses/?courseId=${data.courseId}&lectureId=${data.lectureId}`
//       );

//       toast.promise(res, {
//         loading: "Deleting lecture...",
//         success: "Lecture deleted",
//         error: "Failed to delete lecture",
//       });

//       const response = await res;
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error?.response?.data?.message);
//     }
//   }
// );

// // -------------------------------
// // SLICE
// // -------------------------------
// const lectureSlice = createSlice({
//   name: "lecture",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       // GET LECTURES
//       .addCase(getCourseLecture.fulfilled, (state, action) => {
//         state.lectures = action.payload?.lectures || [];
//       })

//       // ADD LECTURE (single fulfilled handler)
//       .addCase(addCourseLecture.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(addCourseLecture.fulfilled, (state, action) => {
//         state.loading = false;
//         state.lectures = action.payload?.course?.lectures ;
//       })
//       .addCase(addCourseLecture.rejected, (state) => {
//         state.loading = false;
//       });
//   }
// });

// export default lectureSlice.reducer;



import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import axiosInstance from "../Helper/axiosInstance";

const initialState = {
  lectures: [],
  loading: false,
  error: null,
};

/* ---------------- GET LECTURES ---------------- */
export const getCourseLecture = createAsyncThunk(
  "course/lecture/get",
  async (courseId, { rejectWithValue }) => {
    try {
      const res = axiosInstance.get(`/courses/${courseId}`);


      toast.promise(res, {
        loading: "Fetching lectures...",
        success: "Lectures fetched successfully",
        error: "Failed to fetch lectures",
      });

      const response = await res;
      console.log("Get Lectures Response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Fetch lectures failed"
      );
    }
  }
);

/* ---------------- ADD LECTURE (WITH AUTO FILE UPLOAD) ---------------- */
export const addCourseLecture = createAsyncThunk(
  "course/lecture/add",
  async (data, { rejectWithValue }) => {
    try {
      let lectureData = data.lecture;

      /* ---------------- UPLOAD FILE IF REQUIRED ---------------- */
      if (lectureData instanceof File) {
        const formData = new FormData();
        formData.append("file", lectureData);

        const uploadPromise = axiosInstance.post(
          "/files/single",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.promise(uploadPromise, {
          loading: "Uploading lecture file...",
          success: "File uploaded successfully",
          error: "File upload failed",
        });

        const uploadRes = await uploadPromise;

        lectureData = {
          secure_url: uploadRes?.data?.secure_url,
          public_id: uploadRes?.data?.public_id,
        };
      }

      /* ---------------- VALIDATION ---------------- */
      if (!lectureData?.secure_url || !lectureData?.public_id) {
        throw new Error("Invalid lecture file data");
      }

      /* ---------------- CREATE PAYLOAD ---------------- */
      const payload = {
        title: data.title,
        description: data.description,
        lecture: lectureData,
      };

      /* ---------------- ADD LECTURE API ---------------- */
      const addPromise = axiosInstance.post(
        `/courses/${data.id}`,
        payload
      );

      toast.promise(addPromise, {
        loading: "Adding lecture...",
        success: "Lecture added successfully",
        error: "Failed to add lecture",
      });

      const response = await addPromise;

      console.log("Lecture Added Response:", response.data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error.message
      );
    }
  }
);

/* ---------------- DELETE LECTURE ---------------- */
export const deleteCourseLecture = createAsyncThunk(
  "course/lecture/delete",
  async (data, { rejectWithValue }) => {
    try {
      const res = axiosInstance.delete(
        `/courses/?courseId=${data.courseId}&lectureId=${data.lectureId}`
      );

      toast.promise(res, {
        loading: "Deleting lecture...",
        success: "Lecture deleted",
        error: "Failed to delete lecture",
      });

      const response = await res;
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Delete failed"
      );
    }
  }
);

/* ---------------- SLICE ---------------- */
const lectureSlice = createSlice({
  name: "lecture",
  initialState,
  reducers: {
    resetLectures: (state) => {
      state.lectures = [];
      state.error = null;
      state.loading = false;
    },
  },

  extraReducers: (builder) => {
    builder
      /* GET */
      .addCase(getCourseLecture.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCourseLecture.fulfilled, (state, action) => {
        state.loading = false;

        // SAFE NORMALIZATION (VERY IMPORTANT)
        state.lectures =
          action.payload?.lectures ||
          action.payload?.course?.lectures ||
          [];
      })
      .addCase(getCourseLecture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ADD */
      .addCase(addCourseLecture.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCourseLecture.fulfilled, (state, action) => {
        state.loading = false;
        console.log("ADD LECTURE RESPONSE:", action.payload);

        state.lectures =
          action.payload?.course?.lectures ||
          action.payload?.lectures ||
          state.lectures;
      })
      .addCase(addCourseLecture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetLectures } = lectureSlice.actions;
export default lectureSlice.reducer;