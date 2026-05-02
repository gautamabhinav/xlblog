// import React from "react";
import { Routes, Route, Router, Link } from "react-router-dom";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
//import CourseList from "./Pages/Course/CourseList";
import BlogList from "./Pages/Blog/BlogList";
import NotFound from "./Pages/NotFound";
import HomePage from "./Pages/Homepage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

import ForgetPassword from "./Pages/Password/ForgetPassword";
import ResetPassword from "./Pages/Password/ResetPassword";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import UserDashboard from "./Pages/Dashboard/UserDashboard";
import UserDashboardFull from "./Pages/Dashboard/UserDashboardFull";
import AdminDashboardFull from "./Pages/Dashboard/AdminDashboardFull";
// import CourseDescription from "./Pages/Course/CourseDescription";

import BlogDescription from "./Pages/Blog/BlogDescription";
import Profile from "./Pages/User/Profile";
import ChangePassword from "./Pages/Password/ChangePassword";
import EditProfile from "./Pages/User/EditProfile";
// import CreateCourse from "./Pages/Course/CreateCourse";

import CreateBlog from "./Pages/Blog/CreateBlog"
import TestList from "./Pages/Tests/TestList";
import TestTake from "./Pages/Tests/TestTake";
import TestResult from "./Pages/Tests/TestResult";
import TestCreate from "./Pages/Tests/TestCreate";
import TestUploadPDF from "./Pages/Tests/TestUploadPDF";
import TestResultsAdmin from "./Pages/Tests/TestResultsAdmin";
import MyAttempts from "./Pages/Tests/MyAttempts";
import TestLeaderboard from "./Pages/Tests/TestLeaderboard";

// import AddLecture from "./Pages/Dashboard/AddLecture";
// import DisplayLectures from "./Pages/Dashboard/DisplayLectures";
import RequireAuth from "./Components/Auth/RequireAuth";
import NotRequireAuth from "./Components/Auth/NotRequireAuth";
import Denied from "./Pages/Denied";
import ExcelPage from "./Pages/Excel/ExcelPage";
import ChartPage from "./Pages/Excel/ChartViewer"
import ChartViewer from "./Pages/Excel/ChartViewer";
import CommentForm from "./Components/Comments/CommentForm";
import CommentList from "./Components/Comments/CommentList";
// import CreateBlog from "./Pages/Blog/CreateBlog";


// import BlogDescription from "./Pages/Blog/BlogDescription";



const App = () => {
  return (
    <>

      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/courses" element={<CourseList />} /> */}
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/denied" element={<Denied />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

        <Route element={<NotRequireAuth />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>



        <Route element={<RequireAuth allowedRoles={["USER", "ADMIN", "SUPERADMIN"]} />}>
          <Route path="/blog/description" element={<BlogDescription />} />

          {/* <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/fail" element={<CheckoutFail />} /> */}

          <Route path="/changepassword" element={<ChangePassword />} />
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/editprofile" element={<EditProfile />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/dashboard-full" element={<UserDashboardFull />} />
          {/* <Route path="/course/displaylectures" element={<DisplayLectures />} /> */}
        </Route>

        <Route element={<RequireAuth allowedRoles={["ADMIN", "USER", "SUPERADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/dashboard-full" element={<AdminDashboardFull />} />

          
          <Route path="/excel" element={<ExcelPage />} />
          <Route path="/charts" element={<ChartViewer />} />


          {/* <Route path="/course/addlecture" element={<AddLecture />} /> */}
          <Route path="/blog/create" element={<CreateBlog />} />
          <Route path="/tests" element={<TestList />} />
          <Route path="/tests/take/:id" element={<TestTake />} />
          <Route path="/tests/result/:id" element={<TestResult />} />
          {/* Admin create page - restrict to admins */}
          <Route element={<RequireAuth allowedRoles={["ADMIN", "SUPERADMIN"]} />}>
            <Route path="/tests/create" element={<TestCreate />} />
            <Route path="/tests/upload-pdf" element={<TestUploadPDF />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={["ADMIN", "SUPERADMIN", "USER"]} />}>
            <Route path="/tests/attempts" element={<TestResultsAdmin />} />
            <Route path="/tests/my-attempts" element={<MyAttempts />} />
          </Route>

          <Route path="/tests/:id/leaderboard" element={<TestLeaderboard />} />


          {/* <Route path="/blog/create" element={<CommentForm />} />
          <Route path="/blog/create" element={<CommentList />} /> */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;