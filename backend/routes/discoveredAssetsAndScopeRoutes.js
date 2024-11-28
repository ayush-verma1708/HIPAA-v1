// routes/assetRoutes.js
import express from 'express';
import {
  getAllAssets,
  getAssetById,
  getAllScopes,
  getScopeById,
} from '../controllers/discoveredAssets&Scopes.js';

const router = express.Router();

// Asset Routes
router.get('/assets', getAllAssets); // Fetch all assets
router.get('/assets/:id', getAssetById); // Fetch a specific asset by ID

// Scope Routes
router.get('/scopes', getAllScopes); // Fetch all scopes
router.get('/scopes/:id', getScopeById); // Fetch a specific scope by ID

export default router;
