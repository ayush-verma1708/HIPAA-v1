import express from 'express';
import {
  getAllAssets,
  getAssetById,
  getAllScopes,
  getScopeById,
} from '../controllers/discoveredAssets&Scopes.js';

const router = express.Router();

// Asset routes
router.get('/assets', getAllAssets);
router.get('/assets/:id', getAssetById);

// Scope routes
router.get('/scopes', getAllScopes);
router.get('/scopes/:id', getScopeById);

export default router;
