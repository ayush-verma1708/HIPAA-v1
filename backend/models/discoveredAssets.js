import mongoose from 'mongoose';

const discoveredAssetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Name of the asset
    type: { type: String, required: true }, // Asset type (e.g., 'file', 'server', 'cloud resource')
    description: { type: String }, // Optional description
    location: {
      type: String,
      enum: ['local', 'server', 'cloud'], // Location where the asset is discovered
      required: true,
    },
    ipAddress: { type: String }, // IP address (for network assets)
    hostname: { type: String }, // Hostname of the asset
    cloudProvider: { type: String, enum: ['AWS', 'Azure', 'GCP', 'Other'] }, // Cloud provider, if applicable
    region: { type: String }, // Cloud region, if applicable
    discoveredAt: { type: Date, default: Date.now }, // Timestamp when the asset was discovered
    status: { type: String, enum: ['active', 'inactive', 'unknown'], default: 'unknown' }, // Status of the asset
    metadata: { type: mongoose.Schema.Types.Mixed }, // Additional dynamic metadata for the asset
    isScoped: { type: Boolean, default: false }, // Whether the asset is within the defined scope
  },
  { timestamps: true }
);

export const DiscoveredAsset = mongoose.model('DiscoveredAsset', discoveredAssetSchema);
