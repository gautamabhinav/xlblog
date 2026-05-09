import { configureStore } from "@reduxjs/toolkit";
import blogSliceReducer from "../Redux/blogSlice";
import authSliceReducer from "../Redux/authSlice";
import adminSliceReducer from "../Redux/adminSlice"
import chartSliceReducer from "../Redux/chartSlice";
import statSliceReducer from "../Redux/statSlice";
import excelSliceReducer from "../Redux/excelSlice";
import socketReducer from "../Redux/socketSlice"
import aiReducer from "../Redux/aiSlice"
import commentSliceReducer from "../Redux/commentSlice";
import likeSliceReducer from "../Redux/likeSlice";
import notificationReducer from './notificationSlice';
import testReducer from './testSlice';
import courseSliceReducer from "../Redux/courseSlice";
import lectureSliceReducer from "../Redux/lectureSlice";
import razorpaySliceReducer from "./razorpaySlice";

const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    admin: adminSliceReducer,
    blog: blogSliceReducer,
    excel: excelSliceReducer,
    chart: chartSliceReducer,
    likes: likeSliceReducer,
    socket: socketReducer,
    comments: commentSliceReducer,
  notifications: notificationReducer,
    stat: statSliceReducer,
    ai: aiReducer, 
    tests: testReducer,
    course: courseSliceReducer,
    lecture: lectureSliceReducer,
    razorpay: razorpaySliceReducer,
  },
});

export default store;