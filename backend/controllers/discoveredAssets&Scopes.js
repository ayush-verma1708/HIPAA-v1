// controllers/assetController.js
import { DiscoveredAsset } from '../models/discoveredAssets.js';
import { DiscoveredScopes } from '../models/discoveredScopes.js';

// Fetch all discovered assets
export const getAllAssets = async (req, res) => {
  try {
    const assets = await DiscoveredAsset.find();
    res.status(200).json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ message: 'Error fetching assets' });
  }
};

// Fetch a single asset by ID
export const getAssetById = async (req, res) => {
  const { id } = req.params;
  try {
    const asset = await DiscoveredAsset.findById(id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.status(200).json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ message: 'Error fetching asset' });
  }
};

// Fetch all scopes
export const getAllScopes = async (req, res) => {
  try {
    const scopes = await DiscoveredScopes.find().populate('asset');

    if (!scopes || scopes.length === 0) {
      return res.status(404).json({ message: 'No scopes found' });
    }

    res.status(200).json(scopes);
  } catch (error) {
    console.error('Error fetching scopes:', error);

    // Specific error handling based on the error type
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid query parameters' });
    } else if (error.name === 'MongoNetworkError') {
      return res.status(500).json({ message: 'Database connection error' });
    } else {
      return res
        .status(500)
        .json({
          message: 'An unexpected error occurred while fetching scopes',
        });
    }
  }
};

// Fetch a single scope by ID
export const getScopeById = async (req, res) => {
  const { id } = req.params;
  try {
    const scope = await DiscoveredScopes.findById(id).populate('asset');

    if (!scope) {
      return res.status(404).json({ message: 'Scope not found' });
    }

    res.status(200).json(scope);
  } catch (error) {
    console.error('Error fetching scope:', error);

    // Specific error handling based on the error type
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid scope ID format' });
    } else if (error.name === 'MongoNetworkError') {
      return res.status(500).json({ message: 'Database connection error' });
    } else {
      return res
        .status(500)
        .json({
          message: 'An unexpected error occurred while fetching the scope',
        });
    }
  }
};
