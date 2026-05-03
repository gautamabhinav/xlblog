// routes/admin.routes.js
import express from 'express';
import { isAdminOrSuperAdmin, isLoggedIn } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';
import { deleteUser, getAllUsers, updateUserRole } from '../controllers/admin.controller.js';
import { getAllUsersDashboard, getUserActivity } from '../controllers/adminDashboard.controller.js';
import { ipLimiter } from '../middlewares/rateLimiter.middleware.js';
// import { getAllUsers, updateUserRole, deleteUser } from '../controllers/admin.controller.js';

const router = express.Router();

// Only ADMIN and SUPERADMIN can access these routes
router.use(isLoggedIn, authorizeRoles('ADMIN', 'SUPERADMIN'));
// router.put("/users/:id/role", isAdminOrSuperAdmin,

// Get all users
router.get('/users', ipLimiter, getAllUsers);

// Superadmin: get full users activity dashboard
router.get('/dashboard-full', ipLimiter, authorizeRoles('SUPERADMIN'), getAllUsersDashboard);

// Get a single user's activity (paginated) - ADMIN or SUPERADMIN
router.get('/user/:id/activity', ipLimiter, isAdminOrSuperAdmin, getUserActivity);

// Update role
router.put('/users/:id/role', ipLimiter, isAdminOrSuperAdmin, updateUserRole);

// Delete user
router.delete('/users/:id', ipLimiter, deleteUser);

export default router;
