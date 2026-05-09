import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import RequireAuth from "./Components/Auth/RequireAuth";
import NotRequireAuth from "./Components/Auth/NotRequireAuth";
import ErrorBoundary from "./Components/Premium/ErrorBoundary";
import { SkeletonCard } from "./Components/Premium/PremiumShell";

const About = lazy(() => import("./Pages/About"));
const Contact = lazy(() => import("./Pages/Contact"));
const CourseList = lazy(() => import("./Pages/Course/CourseList"));
const BlogList = lazy(() => import("./Pages/Blog/BlogList"));
const NotFound = lazy(() => import("./Pages/NotFound"));
const HomePage = lazy(() => import("./Pages/Homepage"));
const Login = lazy(() => import("./Pages/Login"));
const Signup = lazy(() => import("./Pages/Signup"));
const ForgetPassword = lazy(() => import("./Pages/Password/ForgetPassword"));
const ResetPassword = lazy(() => import("./Pages/Password/ResetPassword"));
const AdminDashboard = lazy(() => import("./Pages/Admin/AdminDashboard"));
const UserDashboard = lazy(() => import("./Pages/Dashboard/UserDashboard"));
const UserDashboardFull = lazy(() => import("./Pages/Dashboard/UserDashboardFull"));
const AdminDashboardFull = lazy(() => import("./Pages/Dashboard/AdminDashboardFull"));
const CourseDescription = lazy(() => import("./Pages/Course/CourseDescription"));
const BlogDescription = lazy(() => import("./Pages/Blog/BlogDescription"));
const Profile = lazy(() => import("./Pages/User/Profile"));
const ChangePassword = lazy(() => import("./Pages/Password/ChangePassword"));
const EditProfile = lazy(() => import("./Pages/User/EditProfile"));
const CreateCourse = lazy(() => import("./Pages/Course/CreateCourse"));
const Checkout = lazy(() => import("./Pages/Payment/Checkout"));
const CheckoutSuccess = lazy(() => import("./Pages/Payment/CheckoutSuccess"));
const CheckoutFail = lazy(() => import("./Pages/Payment/CheckoutFail"));
const DisplayLectures = lazy(() => import("./Pages/Dashboard/DisplayLectures"));
const CreateBlog = lazy(() => import("./Pages/Blog/CreateBlog"));
const TestList = lazy(() => import("./Pages/Tests/TestList"));
const TestTake = lazy(() => import("./Pages/Tests/TestTake"));
const TestResult = lazy(() => import("./Pages/Tests/TestResult"));
const TestCreate = lazy(() => import("./Pages/Tests/TestCreate"));
const TestUploadPDF = lazy(() => import("./Pages/Tests/TestUploadPDF"));
const TestResultsAdmin = lazy(() => import("./Pages/Tests/TestResultsAdmin"));
const MyAttempts = lazy(() => import("./Pages/Tests/MyAttempts"));
const TestLeaderboard = lazy(() => import("./Pages/Tests/TestLeaderboard"));
const OTTExperience = lazy(() => import("./Pages/OTT/OTTExperience"));
const EnterpriseDashboard = lazy(() => import("./Pages/OTT/EnterpriseDashboard"));
const AddLecture = lazy(() => import("./Pages/Dashboard/AddLecture"));
const Denied = lazy(() => import("./Pages/Denied"));
const ExcelPage = lazy(() => import("./Pages/Excel/ExcelPage"));
const ChartViewer = lazy(() => import("./Pages/Excel/ChartViewer"));

const RouteFallback = () => (
  <div className="min-h-screen bg-premium-black p-6 text-white">
    <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
    </div>
  </div>
);



const App = () => {
  return (
    <>
    {/* <LayoutImproved> */}
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
         <Route path="/courses" element={<CourseList />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/ott" element={<OTTExperience />} />
        <Route path="/denied" element={<Denied />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

        <Route element={<NotRequireAuth />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>



        <Route element={<RequireAuth allowedRoles={["USER", "ADMIN", "SUPERADMIN"]} />}>
          <Route path="/blog/description" element={<BlogDescription />} />

           <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/fail" element={<CheckoutFail />} /> 
          <Route path="/course/description" element={<CourseDescription />} />
          <Route path="/course/create" element={<CreateCourse />} />
          <Route path="/changepassword" element={<ChangePassword />} />
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/editprofile" element={<EditProfile />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/dashboard-full" element={<UserDashboardFull />} />
           <Route path="/course/displaylectures" element={<DisplayLectures />} /> 
        </Route>

        <Route element={<RequireAuth allowedRoles={["ADMIN", "USER", "SUPERADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/dashboard-full" element={<AdminDashboardFull />} />
          <Route path="/enterprise/dashboard" element={<EnterpriseDashboard />} />

          
          <Route path="/excel" element={<ExcelPage />} />
          <Route path="/charts" element={<ChartViewer />} />


          <Route path="/course/addlecture" element={<AddLecture />} />
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
      </Suspense>
    </ErrorBoundary>
    {/* </LayoutImproved> */}
    </>
  );
};

export default App;
