import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import models from '../models/index.js';
import AppError from '../utils/AppError.js';
import Joi from 'joi';
import _ from 'lodash';

export const listModels = (req, res) => {
  const keys = Object.keys(models);
  return res.json({ success: true, models: keys.map(k => k.toLowerCase()) });
};

export const createGenericController = (modelName) => {
  const Model = models[modelName];
  if (!Model) throw new Error(`Model ${modelName} not found in registry`);

  // derive a lightweight schema descriptor for frontend
  const deriveSchemaDescriptor = () => {
    const paths = Model.schema.paths;
    const descriptor = Object.keys(paths).reduce((acc, p) => {
      const path = paths[p];
      if (['_id','__v'].includes(p)) return acc;
      const desc = { type: (path.instance || 'Mixed').toLowerCase() };
      if (path.options && path.options.ref) desc.ref = path.options.ref;
      if (path.options && path.options.enum) desc.enum = path.options.enum;
      acc[p] = desc;
      return acc;
    }, {});
    return descriptor;
  };

  const schemaDescriptor = deriveSchemaDescriptor();

  const buildJoiFromDescriptor = (desc) => {
    const keys = {};
    for (const [k,v] of Object.entries(desc)){
      switch(v.type){
        case 'string': keys[k] = Joi.string(); break;
        case 'number': keys[k] = Joi.number(); break;
        case 'date': keys[k] = Joi.date(); break;
        case 'boolean': keys[k] = Joi.boolean(); break;
        default: keys[k] = Joi.any(); break;
      }
    }
    return Joi.object(keys);
  };

  const joiSchema = buildJoiFromDescriptor(schemaDescriptor);

  return {
    // return schema descriptor for frontend form generation
    schema: asyncHandler(async (req, res) => {
      res.json({ success: true, schema: schemaDescriptor });
    }),

    create: asyncHandler(async (req, res) => {
      // validate incoming body using Joi
      const validated = joiSchema.validate(req.body, { stripUnknown: true });
      if (validated.error) return res.status(400).json({ success: false, message: validated.error.message });
      const payload = validated.value;

      // prevent mass assignment by allowing only schema paths
      const allowed = Object.keys(Model.schema.paths).filter(p => !['_id','__v','createdAt','updatedAt','password'].includes(p));
      const safePayload = _.pick(payload, allowed);

      const doc = await Model.create(safePayload);
      res.status(201).json({ success: true, data: doc });
    }),

    readAll: asyncHandler(async (req, res) => {
      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.min(parseInt(req.query.limit || '20', 10), 200);
      const skip = (page - 1) * limit;

      // Filtering: simple key=value pairs in query (excluding special params)
      const special = ['page','limit','sort','fields'];
      const filter = Object.keys(req.query).reduce((acc,k) => {
        if (special.includes(k)) return acc;
        acc[k] = req.query[k];
        return acc;
      }, {});

      // Sorting: ?sort=field:asc or field:desc or multiple comma-separated
      let sortObj = {};
      if (req.query.sort){
        req.query.sort.split(',').forEach(s => {
          const [f,dir] = s.split(':');
          sortObj[f] = dir === 'desc' ? -1 : 1;
        });
      }

      const query = Model.find(filter).skip(skip).limit(limit);
      if (Object.keys(sortObj).length) query.sort(sortObj);
      const docs = await query.lean();
      const total = await Model.countDocuments(filter);
      res.json({ success: true, data: docs, meta: { total, page, limit } });
    }),

    readOne: asyncHandler(async (req, res) => {
      const id = req.params.id;
      const doc = await Model.findById(id).lean();
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: doc });
    }),

    update: asyncHandler(async (req, res) => {
      const id = req.params.id;
      // validate and strip unknowns
      const validated = joiSchema.validate(req.body, { stripUnknown: true });
      if (validated.error) return res.status(400).json({ success: false, message: validated.error.message });
      let payload = validated.value;

      // RBAC: prevent non-superadmin from changing sensitive fields like role on User model
      if (modelName === 'User'){
        const userRole = String(req.user?.role || '').toUpperCase();
        if (payload.role && userRole !== 'SUPERADMIN'){
          return res.status(403).json({ success: false, message: 'Not allowed to change role' });
        }
      }

      const allowed = Object.keys(Model.schema.paths).filter(p => !['_id','__v','createdAt','updatedAt','password'].includes(p));
      const safePayload = _.pick(payload, allowed);
      const doc = await Model.findByIdAndUpdate(id, safePayload, { new: true, runValidators: true }).lean();
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: doc });
    }),

    remove: asyncHandler(async (req, res) => {
      const id = req.params.id;
      const doc = await Model.findByIdAndDelete(id).lean();
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: doc });
    }),
  };
};
