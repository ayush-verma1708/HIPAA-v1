import React, { useEffect, useState } from 'react';
import { getAllAssets, getAllScopes } from '../api/discoveredAssetsApi'; // Import the API functions

const DiscoveredAssetsAndScopes = () => {
  const [assets, setAssets] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both assets and scopes in parallel
        const [assetsData, scopesData] = await Promise.all([
          getAllAssets(),
          getAllScopes(),
        ]);
        setAssets(assetsData);
        setScopes(scopesData);
        setLoading(false); // Set loading to false when both data are fetched
      } catch (error) {
        setError('Failed to load assets and scopes');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading assets and scopes...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Assets and Scopes</h1>
      <div style={styles.container}>
        {/* Display Assets */}
        <div style={styles.column}>
          <h2>Assets</h2>
          <ul>
            {assets.map((asset) => (
              <li key={asset._id} style={styles.item}>
                <h3>{asset.name}</h3>
                <p>Type: {asset.type}</p>
                <p>Location: {asset.location}</p>
                <p>Status: {asset.status}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Display Scopes */}
        <div style={styles.column}>
          <h2>Scopes</h2>
          <ul>
            {scopes.map((scope) => (
              <li key={scope._id} style={styles.item}>
                <h3>{scope.name}</h3>
                {/* Check if 'asset' is available before accessing its 'name' */}
                <p>
                  Asset: {scope.asset ? scope.asset.name : 'No asset assigned'}
                </p>
                <p>Description: {scope.description || 'No description'}</p>
                <p>Type: {scope.type}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Inline styles to align the assets and scopes side by side
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    marginTop: '20px',
  },
  column: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  item: {
    marginBottom: '15px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: '#fff',
  },
};

export default DiscoveredAssetsAndScopes;
