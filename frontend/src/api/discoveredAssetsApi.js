// api.js

const API_BASE_URL = 'http://localhost:8021/api'; // Replace with your actual backend URL

// Function to fetch all scopes
export const getAllScopes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/scopes`);

    if (!response.ok) {
      throw new Error(`Error fetching scopes: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Return the list of scopes
  } catch (error) {
    console.error('Error fetching all scopes:', error);
    throw error; // Re-throw the error to be handled in the component
  }
};

// Function to fetch a single scope by ID
export const getScopeById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scopes/${id}`);

    if (!response.ok) {
      throw new Error(`Error fetching scope by ID: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Return the single scope data
  } catch (error) {
    console.error('Error fetching scope by ID:', error);
    throw error; // Re-throw the error to be handled in the component
  }
};

// Function to fetch all assets
export const getAllAssets = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets`);

    if (!response.ok) {
      throw new Error(`Error fetching assets: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Return the list of assets
  } catch (error) {
    console.error('Error fetching all assets:', error);
    throw error; // Re-throw the error to be handled in the component
  }
};

// Function to fetch a single asset by ID
export const getAssetById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`);

    if (!response.ok) {
      throw new Error(`Error fetching asset by ID: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Return the single asset data
  } catch (error) {
    console.error('Error fetching asset by ID:', error);
    throw error; // Re-throw the error to be handled in the component
  }
};
