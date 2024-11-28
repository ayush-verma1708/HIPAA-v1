import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DiscoveredAsset } from '../../models/discoveredAssets.js'; // Adjust the path to your model
import { DiscoveredScopes } from '../../models/discoveredScopes.js'; // Adjust the path to your model

dotenv.config(); // Load environment variables

async function populateHEPAAssetsAndScopes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully.');

    // Data for HEPA Discovered Assets
    const discoveredAssetsData = [
      {
        name: 'HEPA Compliance Server',
        type: 'server',
        description: 'Server for HEPA compliance document storage',
        location: 'server',
        ipAddress: '192.168.1.10',
        hostname: 'hepa-server-1',
        cloudProvider: null,
        region: null,
        status: 'active',
        isScoped: true,
      },
      {
        name: 'HEPA Cloud Storage',
        type: 'cloud resource',
        description: 'Cloud storage for HEPA-related data',
        location: 'cloud',
        cloudProvider: 'AWS',
        region: 'us-east-1',
        status: 'active',
        isScoped: true,
      },
      {
        name: 'HEPA Local Workstation',
        type: 'file',
        description: 'Local workstation for HEPA compliance monitoring',
        location: 'local',
        hostname: 'hepa-workstation-1',
        status: 'active',
        isScoped: false,
      },
    ];

    // Data for HEPA Scoped Services
    const scopedData = [
      {
        name: 'Compute',
        description: 'Compute resources for running HEPA compliance checks',
        assetName: 'HEPA Compliance Server',
        cloudProvider: 'AWS',
        serviceType: 'EC2',
        region: 'us-east-1',
        usageDetails: { cpu: 40, memory: 8, storage: 100, network: 20 },
        cost: 500,
      },
      {
        name: 'Storage',
        description: 'Storage for HEPA-related files',
        assetName: 'HEPA Cloud Storage',
        cloudProvider: 'AWS',
        serviceType: 'S3',
        region: 'us-east-1',
        usageDetails: { storage: 200 },
        cost: 300,
      },
    ];

    // Seed Discovered Assets
    for (const assetData of discoveredAssetsData) {
      const existingAsset = await DiscoveredAsset.findOne({
        name: assetData.name,
      });
      if (existingAsset) {
        console.log(`Asset "${assetData.name}" already exists. Skipping.`);
      } else {
        const newAsset = new DiscoveredAsset(assetData);
        await newAsset.save();
        console.log(`Asset "${assetData.name}" added successfully.`);
      }
    }

    // Seed Scoped Services
    for (const scopeData of scopedData) {
      // Find the associated asset by name
      const associatedAsset = await DiscoveredAsset.findOne({
        name: scopeData.assetName,
      });
      if (!associatedAsset) {
        console.log(
          `Associated asset "${scopeData.assetName}" not found. Skipping scope "${scopeData.name}".`
        );
        continue;
      }

      const existingScope = await DiscoveredScopes.findOne({
        name: scopeData.name,
        asset: associatedAsset._id,
      });
      if (existingScope) {
        console.log(
          `Scope "${scopeData.name}" already exists for asset "${scopeData.assetName}". Skipping.`
        );
      } else {
        const newScope = new DiscoveredScopes({
          ...scopeData,
          asset: associatedAsset._id, // Associate with the found asset
        });
        await newScope.save();
        console.log(`Scope "${scopeData.name}" added successfully.`);
      }
    }
  } catch (error) {
    console.error('Error during HEPA asset and scope population:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the script
populateHEPAAssetsAndScopes();
