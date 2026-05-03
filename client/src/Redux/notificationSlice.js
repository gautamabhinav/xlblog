// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '../Helper/axiosInstance';

// export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
//   try {
//     const res = await axiosInstance.get('/notifications');
//     return res.data;
//   } catch (err) {
//     return rejectWithValue(err.response?.data || err.message);
//   }
// });

// export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue, getState }) => {
//   try {
//     await axiosInstance.post(`/notifications/${id}/read`);
//     const state = getState();
//     const currentUserId = state?.auth?.data?._id || state?.auth?.user?._id || state?.auth?.user?.id || null;
//     return { id, currentUserId };
//   } catch (err) {
//     return rejectWithValue(err.response?.data || err.message);
//   }
// });

// export const createNotification = createAsyncThunk('notifications/create', async (payload, { rejectWithValue }) => {
//   try {
//     const res = await axiosInstance.post('/notifications', payload);
//     return res.data.notification;
//   } catch (err) {
//     return rejectWithValue(err.response?.data || err.message);
//   }
// });

// const slice = createSlice({
//   name: 'notifications',
//   initialState: { list: [], unreadCount: 0, loading: false, error: null },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchNotifications.pending, (s) => { s.loading = true; s.error = null; })
//       .addCase(fetchNotifications.fulfilled, (s, a) => { s.loading = false; s.list = a.payload.notifications || []; s.unreadCount = a.payload.unreadCount || 0; })
//       .addCase(fetchNotifications.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
//       .addCase(markNotificationRead.fulfilled, (s, a) => { s.list = s.list.map(n => n._id === a.payload.id ? { ...n, _read: true } : n); s.unreadCount = Math.max(0, s.unreadCount - 1); })
//       .addCase(markNotificationRead.fulfilled, (s, a) => {
//         // mark the item's readBy to include current user (UI relies on readBy)
//         s.list = s.list.map(n => {
//           if (n._id === a.payload.id) {
//             const already = (n.readBy || []).some(r => String(r.user) === String(a.payload.currentUserId));
//             return { ...n, readBy: already ? n.readBy : [...(n.readBy || []), { user: a.payload.currentUserId, readAt: new Date().toISOString() }] };
//           }
//           return n;
//         });
//         s.unreadCount = Math.max(0, s.unreadCount - 1);
//       })
//       .addCase(createNotification.fulfilled, (s, a) => { s.list.unshift(a.payload); s.unreadCount += 1; });
//   }
// });

// export default slice.reducer;



import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../Helper/axiosInstance';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/notifications');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue, getState }) => {
    try {
      await axiosInstance.post(`/notifications/${id}/read`);
      const state = getState();
      const currentUserId =
        state?.auth?.data?._id ||
        state?.auth?.user?._id ||
        state?.auth?.user?.id ||
        null;
      return { id, currentUserId };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createNotification = createAsyncThunk(
  'notifications/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post('/notifications', payload);
      return res.data.notification;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const slice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload.notifications || [];
        s.unreadCount = a.payload.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // Mark Read
      .addCase(markNotificationRead.fulfilled, (s, a) => {
        s.list = s.list.map((n) => {
          if (n._id === a.payload.id) {
            // mark `_read` true
            const updated = { ...n, _read: true };

            // update `readBy` if not already marked
            const already = (n.readBy || []).some(
              (r) => String(r.user) === String(a.payload.currentUserId)
            );

            if (!already && a.payload.currentUserId) {
              updated.readBy = [
                ...(n.readBy || []),
                { user: a.payload.currentUserId, readAt: new Date().toISOString() },
              ];
            }

            return updated;
          }
          return n;
        });

        s.unreadCount = Math.max(0, s.unreadCount - 1);
      })

      // Create
      .addCase(createNotification.fulfilled, (s, a) => {
        s.list.unshift(a.payload);
        s.unreadCount += 1;
      });
  },
});

export default slice.reducer;
