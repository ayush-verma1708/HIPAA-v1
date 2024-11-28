import mongoose from 'mongoose';

const discoveredScopeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Name of the scope, e.g., 'Compute', 'Storage', 'Networking'
    },
    description: {
      type: String, // Optional description of the scope
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset', // Reference to the associated asset
      required: true,
    },
    cloudProvider: {
      type: String,
      enum: ['AWS', 'Azure', 'GCP', 'Other'], // Cloud provider where this scope is applicable
      required: true,
    },
    serviceType: {
      type: String,
      required: true, // Service type within the cloud platform, e.g., 'EC2', 'S3', 'Lambda' for AWS
    },
    region: {
      type: String, // Cloud region where this service is running, e.g., 'us-east-1'
    },
    usageDetails: {
      cpu: { type: Number }, // CPU usage, if applicable
      memory: { type: Number }, // Memory usage, if applicable
      storage: { type: Number }, // Storage usage, if applicable
      network: { type: Number }, // Network bandwidth usage, if applicable
    },
    cost: {
      type: Number, // Cost incurred for using this service
    },
    isActive: {
      type: Boolean,
      default: true, // Whether this service is currently active
    },
  },
  { timestamps: true }
);

export const DiscoveredScopes = mongoose.model(
  'DiscoveredScopes',
  discoveredScopeSchema
);
