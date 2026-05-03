// import { createSlice } from "@reduxjs/toolkit";
// import { io } from "socket.io-client";

// const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

// let socket = null;

// const initialState = {
//   socket: null,
//   onlineUsers: [],
// };

// const socketSlice = createSlice({
//   name: "socket",
//   initialState,
//   reducers: {
//     setSocket: (state, action) => {
//       state.socket = action.payload;
//     },
//     setOnlineUsers: (state, action) => {
//       state.onlineUsers = action.payload;
//     },
//     disconnectSocket: (state) => {
//       if (state.socket?.connected) state.socket.disconnect();
//       state.socket = null;
//       state.onlineUsers = [];
//     },
//   },
// });

// export const { setSocket, setOnlineUsers, disconnectSocket } = socketSlice.actions;

// // Thunk to connect socket
// export const connectSocket = () => (dispatch, getState) => {
//   const { auth } = getState();
//   if (!auth.isLoggedIn || socket?.connected) return;

//   socket = io(BASE_URL, { withCredentials: true });
//   socket.connect();

//   dispatch(setSocket(socket));

//   socket.on("getOnlineUsers", (userIds) => {
//     dispatch(setOnlineUsers(userIds));
//   });
// };

// export default socketSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

// Keep socket instance OUTSIDE redux state
let socket = null;

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5014"
    : import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, "") ||
      "https://blex-thlc.onrender.com";

const initialState = {
  connected: false,
  onlineUsers: [],
  socketId: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setSocketId: (state, action) => {
      state.socketId = action.payload;
    },
    disconnectSocket: (state) => {
      if (socket?.connected) socket.disconnect();
      socket = null;
      state.connected = false;
      state.onlineUsers = [];
      state.socketId = null;
    },
  },
});

export const { setConnected, setOnlineUsers, setSocketId, disconnectSocket } =
  socketSlice.actions;

export const connectSocket = () => (dispatch, getState) => {
  const { auth } = getState();
  if (!auth.isLoggedIn || socket?.connected) return;

  if (!socket) {
    socket = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }

  if (!socket.hasListeners) {
    socket.on("connect", () => {
      dispatch(setConnected(true));
      dispatch(setSocketId(socket.id));
    });

    socket.on("disconnect", () => {
      dispatch(setConnected(false));
      dispatch(setSocketId(null));
    });

    socket.on("getOnlineUsers", (userIds) => {
      dispatch(setOnlineUsers(userIds));
    });

    socket.hasListeners = true;
  }

  socket.connect();
};

export const getSocket = () => socket;
export default socketSlice.reducer;
