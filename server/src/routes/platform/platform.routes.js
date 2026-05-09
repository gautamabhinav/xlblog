import { Router } from "express";
import { getPlatformArchitecture } from "../../controllers/platform/platform.controller.js";
import { authorizeRoles, isLoggedIn } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/architecture", isLoggedIn, authorizeRoles("ADMIN", "SUPERADMIN"), getPlatformArchitecture);

export default router;
