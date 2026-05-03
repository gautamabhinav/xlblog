// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import axiosInstance from "../Helper/axiosInstance";
// import toast from "react-hot-toast";

// const initialState = {
//   list: [],
//   current: null,
//   attempt: null,
//   loading: false,
//   error: null,
// };

// export const fetchTests = createAsyncThunk("tests/fetchAll", async (_, { rejectWithValue }) => {
//   try {
//     const res = await axiosInstance.get("/tests");
//     return res.data.tests;
//   } catch (err) {
//     toast.error(err?.response?.data?.message || "Failed to fetch tests");
//     return rejectWithValue(err?.response?.data || err.message);
//   }
// });

// export const fetchTest = createAsyncThunk("tests/fetchOne", async (id, { rejectWithValue }) => {
//   try {
//     const res = await axiosInstance.get(`/tests/${id}`);
//     return res.data.test;
//   } catch (err) {
//     toast.error(err?.response?.data?.message || "Failed to fetch test");
//     return rejectWithValue(err?.response?.data || err.message);
//   }
// });

// export const submitAttempt = createAsyncThunk("tests/submit", async ({ id, payload }, { rejectWithValue }) => {
//   try {
//     const res = await axiosInstance.post(`/tests/${id}/submit`, payload);
//     return res.data; // { attempt, analysis }
//   } catch (err) {
//     toast.error(err?.response?.data?.message || "Failed to submit attempt");
//     return rejectWithValue(err?.response?.data || err.message);
//   }
// });

// export const fetchAttempt = createAsyncThunk("tests/fetchAttempt", async (id, { rejectWithValue }) => {
//   try {
//     const res = await axiosInstance.get(`/tests/attempt/${id}`);
//     return res.data.attempt;
//   } catch (err) {
//     toast.error(err?.response?.data?.message || "Failed to fetch attempt");
//     return rejectWithValue(err?.response?.data || err.message);
//   }
// });

// const slice = createSlice({
//   name: "tests",
//   initialState,
//   reducers: {
//     // clearCurrent(state) {
//     //   state.current = null;
//     //   state.attempt = null;
//     // },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchTests.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTests.fulfilled, (state, action) => {
//         state.loading = false;
//         state.list = action.payload || [];
//       })
//       .addCase(fetchTests.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       .addCase(fetchTest.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTest.fulfilled, (state, action) => {
//         state.loading = false;
//         state.current = action.payload;
//       })
//       .addCase(fetchTest.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       .addCase(submitAttempt.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(submitAttempt.fulfilled, (state, action) => {
//         state.loading = false;
//         state.attempt = action.payload.attempt || null;
//         // keep analysis in attempt.analysis if you want
//       })
//       .addCase(submitAttempt.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       .addCase(fetchAttempt.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAttempt.fulfilled, (state, action) => {
//         state.loading = false;
//         state.attempt = action.payload;
//       })
//       .addCase(fetchAttempt.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const {  } = slice.actions;
// export default slice.reducer;




import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import axiosInstance from "../Helper/axiosInstance";

/* ------------------ Helpers ------------------ */
const normalizeError = (err) =>
  err?.response?.data?.message || err?.message || "Something went wrong";

/* ------------------ Initial State ------------------ */
const initialState = {
  list: [],
  current: null,
  attempt: null,
  loading: {
    list: false,
    current: false,
    attempt: false,
    submit: false,
  },
  error: null,
};

/* ------------------ Thunks ------------------ */
export const fetchTests = createAsyncThunk(
  "tests/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/tests");
      // console.log(res.data.tests);
      return res.data.tests;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const fetchTest = createAsyncThunk(
  "tests/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/tests/${id}`);
      return res.data.test;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const submitAttempt = createAsyncThunk(
  "tests/submit",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/tests/${id}/submit`, payload);
      return res.data; // { attempt, analysis }
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const fetchAttempt = createAsyncThunk(
  "tests/fetchAttempt",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/tests/attempt/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

/* ------------------ Slice ------------------ */
const testsSlice = createSlice({
  name: "tests",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
      state.attempt = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* -------- Fulfilled -------- */
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading.list = false;
        state.list = action.payload || [];
      })
      .addCase(fetchTest.fulfilled, (state, action) => {
        state.loading.current = false;
        state.current = action.payload;
      })
      .addCase(fetchAttempt.fulfilled, (state, action) => {
        state.loading.attempt = false;
        state.attempt = action.payload?.attempt || action.payload;
      })
      .addCase(submitAttempt.fulfilled, (state, action) => {
        state.loading.submit = false;
        state.attempt = action.payload?.attempt || null;
      })

      /* -------- Pending (matcher) -------- */
      .addMatcher(
        isAnyOf(
          fetchTests.pending,
          fetchTest.pending,
          fetchAttempt.pending,
          submitAttempt.pending
        ),
        (state, action) => {
          state.error = null;

          if (action.type.includes("fetchAll")) state.loading.list = true;
          if (action.type.includes("fetchOne")) state.loading.current = true;
          if (action.type.includes("fetchAttempt")) state.loading.attempt = true;
          if (action.type.includes("submit")) state.loading.submit = true;
        }
      )

      /* -------- Rejected (matcher) -------- */
      .addMatcher(
        isAnyOf(
          fetchTests.rejected,
          fetchTest.rejected,
          fetchAttempt.rejected,
          submitAttempt.rejected
        ),
        (state, action) => {
          state.loading = initialState.loading;
          state.error = action.payload;
        }
      );
  },
});

/* ------------------ Exports ------------------ */
export const { clearCurrent, clearError } = testsSlice.actions;
export default testsSlice.reducer;
