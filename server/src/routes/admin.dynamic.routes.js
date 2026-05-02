import express from 'express';
import { authorizeRoles, isLoggedIn } from '../middlewares/auth.middleware.js';
import { listModels, createGenericController } from '../controllers/generic.controller.js';
import { ipLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

// All admin model routes are protected: ADMIN or SUPERADMIN
router.use(isLoggedIn, authorizeRoles('ADMIN', 'SUPERADMIN'));

// GET /api/v1/admin/models
router.get('/models', ipLimiter, listModels);

// GET /api/v1/admin/:model/schema
router.get('/:model/schema', ipLimiter, (req, res, next) => {
  try{
    const name = req.params.model;
    const controller = createGenericController(name.charAt(0).toUpperCase() + name.slice(1));
    return controller.schema(req, res, next);
  }catch(err){
    return next(err);
  }
});

// Dynamic CRUD for models at /api/v1/admin/:model
router.get('/:model', async (req, res, next) => {
  try {
    const name = req.params.model;
    const controller = createGenericController(name.charAt(0).toUpperCase() + name.slice(1));
    return controller.readAll(req, res, next);
  } catch (err) {
    return next(err);
  }
});

router.post('/:model', async (req, res, next) => {
  try {
    const name = req.params.model;
    const controller = createGenericController(name.charAt(0).toUpperCase() + name.slice(1));
    return controller.create(req, res, next);
  } catch (err) {
    return next(err);
  }
});

router.get('/:model/:id', async (req, res, next) => {
  try {
    const name = req.params.model;
    const controller = createGenericController(name.charAt(0).toUpperCase() + name.slice(1));
    return controller.readOne(req, res, next);
  } catch (err) {
    return next(err);
  }
});

router.put('/:model/:id', async (req, res, next) => {
  try {
    const name = req.params.model;
    const controller = createGenericController(name.charAt(0).toUpperCase() + name.slice(1));
    return controller.update(req, res, next);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:model/:id', async (req, res, next) => {
  try {
    const name = req.params.model;
    const controller = createGenericController(name.charAt(0).toUpperCase() + name.slice(1));
    return controller.remove(req, res, next);
  } catch (err) {
    return next(err);
  }
});

export default router;
