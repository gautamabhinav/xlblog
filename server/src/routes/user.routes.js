import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  getLoggedInUserDetails,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUser,
  updateUserRole,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { getUserDashboard } from '../controllers/userDashboard.controller.js';
import { uploadSingle } from "../middlewares/multer.middleware.js";
import {  ipLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// router.post("/register", ultraStrictLimiter, upload.single("avatar"), registerUser);
// router.post("/login", upload.single("avatar"), ultraStrictLimiter, loginUser);
// router.post("/reset", ultraStrictLimiter , forgotPassword);
// router.post("/reset/:resetToken", ultraStrictLimiter, resetPassword);


// router.post("/logout",userLimiter , logoutUser);
// router.get("/me", userLimiter, isLoggedIn, getLoggedInUserDetails);
// router.post("/change-password",userLimiter , isLoggedIn, changePassword);
// router.put("/update/:id",userLimiter , isLoggedIn, upload.single("avatar"), updateUser);
// router.put('/:id/role', userLimiter, isLoggedIn, updateUserRole);


router.post("/register", ipLimiter, uploadSingle("avatar", ["image"]), registerUser);
router.post("/login", ipLimiter, loginUser);
router.post("/reset", ipLimiter, forgotPassword);
router.post("/reset/:resetToken", ipLimiter, resetPassword);


router.post("/logout", ipLimiter, logoutUser);
router.get("/me", ipLimiter, isLoggedIn, getLoggedInUserDetails);
// consolidated user dashboard
router.get('/dashboard', ipLimiter, isLoggedIn, getUserDashboard);
router.post("/change-password", ipLimiter, isLoggedIn, changePassword);
// router.put("/update/:id", isLoggedIn, upload.single("avatar"), updateUser);
router.put("/update/:id", ipLimiter, isLoggedIn, uploadSingle("avatar", ["image"]), // <-- multer parses FormData
  updateUser);
router.put('/:id/role', ipLimiter, isLoggedIn, updateUserRole);

export default router;




// import { Router } from "express";
// import {
//   registerUser,
//   loginUser,
//   logoutUser,
//   forgotPassword,
//   resetPassword,
//   changePassword,
//   updateUser,
//   getLoggedInUserDetails,
// } from "../controllers/user.controller.js";

// import { isLoggedIn } from "../middlewares/auth.middleware.js";
// import upload from "../middlewares/multer.middleware.js";

// // import {
// //   ipLimiter,
// //   ultraStrictLimiter,
// //   userLimiter,
// // } from "../middlewares/ratelimiter.middleware.js";

// const router = Router();

// // 🔐 Ultra-strict: Login, Register
// router.post("/register", ultraStrictLimiter, upload.single("avatar"), registerUser);
// router.post("/login", ultraStrictLimiter, loginUser);
// router.post("/reset", ultraStrictLimiter, forgotPassword);
// router.post("/reset/:resetToken", ultraStrictLimiter, resetPassword);

// // 🔐 IP-based: Forgot Password, Reset

// // router.post("/reset", ipLimiter, forgotPassword);
// // router.post("/reset/:resetToken", ipLimiter, resetPassword);

// // 🔐 User-based: Protected routes
// router.post("/logout", isLoggedIn, userLimiter, logoutUser);
// router.get("/me", isLoggedIn, userLimiter, getLoggedInUserDetails);
// router.post("/change-password", isLoggedIn, userLimiter, changePassword);
// router.put("/update/:id", isLoggedIn, userLimiter, upload.single("avatar"), updateUser);

// export default router;
