import mongoose from 'mongoose';
import Control from './control.js'; // Adjust the path as necessary

const ChangeHistorySchema = new mongoose.Schema({
  modifiedAt: { type: Date, default: Date.now },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,

    ref: 'User',
  }, // Username or ID of the person making the modification
  changes: { type: Map, of: String }, // Record of what was changed, in key-value pairs
});

const CompletionStatusSchema = new mongoose.Schema(
  {
    actionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Action',
      required: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    scopeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scoped',
      default: null,
    },
    controlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Control',
      required: true,
    },
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ControlFamily',
      required: true,
    },
    selectedSoftware: {
      // New field for selected software
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Software', // Reference to the Software model
      default: null,
    },
    isSoftwareSelected: {
      // Boolean field to indicate if software is selected
      type: Boolean,
      default: false,
    },
    isCompleted: { type: Boolean, default: false },
    isEvidenceUploaded: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    isTask: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    AssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    AssignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: [
        'Open',
        'Delegated to IT Team',
        'Evidence Uploaded',
        'Audit Delegated',
        'Not Applicable',
        'Not Applicable (Pending Auditor Confirmation)',
        'Wrong Evidence',
        'Risk Accepted',
        'Completed',
        'External Audit Delegated',
      ],
      default: 'Open',
    },
    action: {
      type: String,
      enum: [
        'Delegate to IT',
        'Submit Evidence',
        'Delegate to Auditor',
        'Confirm Evidence',
        'Return Evidence',
        'Delegate to External Auditor',
      ],
    },
    feedback: { type: String, default: null }, // Optional field to store auditor's feedback
    history: [ChangeHistorySchema], // Array of change history records
    // New fields for auditor confirmation on "Not Applicable" status
    isAuditorConfirmedForNotApplicable: { type: Boolean, default: false }, // Tracks auditor confirmation
  },
  {
    timestamps: true,
  }
);

CompletionStatusSchema.statics.calculateRiskByAsset = async function (assetId) {
  try {
    const assetStatuses = await this.find({ assetId, isTask: true });
    let riskScore = 0;
    let criticality = 'low'; // Default value

    // Fetch all controls related to this asset
    const controls = await Control.find({
      _id: { $in: assetStatuses.map((status) => status.controlId) },
    });

    // Determine the criticality based on related controls
    const assetControls = controls.filter((control) =>
      assetStatuses.some((status) => status.controlId.equals(control._id))
    );

    if (assetControls.length > 0) {
      // Find the highest criticality among the controls
      criticality = assetControls.reduce(
        (max, control) =>
          control.criticality > max ? control.criticality : max,
        'low'
      );
    }

    assetStatuses.forEach((status) => {
      if (!status.isCompleted) {
        // Find the control related to this status
        const control = controls.find((c) => c._id.equals(status.controlId));
        if (control) {
          // Adjust riskScore based on control's criticality
          let multiplier = 1;

          switch (control.criticality) {
            case 'medium':
              multiplier = 2;
              break;
            case 'high':
              multiplier = 3;
              break;
            case 'critical':
              multiplier = 4;
              break;
            default:
              multiplier = 1;
          }

          riskScore += 10 * multiplier; // Adjust the base score as needed
        }
      }
    });

    return {
      assetId,
      totalRiskScore: riskScore,
      criticality, // Include criticality in the result
      scopeId: assetStatuses[0].scopeId || null, // Display scopeId if it exists
      numberOfIncompleteActions: assetStatuses.filter(
        (status) => !status.isCompleted
      ).length,
    };
  } catch (error) {
    console.error('Error in calculateRiskByAsset:', error);
    throw error;
  }
};

CompletionStatusSchema.statics.calculateOverallRisk = async function () {
  try {
    const allStatuses = await this.find({ isTask: true });
    const riskMap = new Map();
    const criticalityMap = new Map(); // Track criticality for each asset
    const scopeMap = new Map(); // Track scopeId for each asset

    // Fetch all controls related to these statuses
    const controls = await Control.find({
      _id: { $in: allStatuses.map((status) => status.controlId) },
    });

    allStatuses.forEach((status) => {
      if (!status.isCompleted) {
        // Find the control related to this status
        const control = controls.find((c) => c._id.equals(status.controlId));
        if (control) {
          let multiplier = 1;

          switch (control.criticality) {
            case 'medium':
              multiplier = 2;
              break;
            case 'high':
              multiplier = 3;
              break;
            case 'critical':
              multiplier = 4;
              break;
            default:
              multiplier = 1;
          }

          if (riskMap.has(status.assetId)) {
            riskMap.set(
              status.assetId,
              riskMap.get(status.assetId) + 10 * multiplier
            ); // Adjust the base score as needed
          } else {
            riskMap.set(status.assetId, 10 * multiplier); // Adjust the base score as needed
          }

          // Track the highest criticality for each asset
          if (
            !criticalityMap.has(status.assetId) ||
            control.criticality > criticalityMap.get(status.assetId)
          ) {
            criticalityMap.set(status.assetId, control.criticality);
          }

          // Track scopeId for each asset if available
          if (!scopeMap.has(status.assetId) && status.scopeId) {
            scopeMap.set(status.assetId, status.scopeId);
          }
        }
      }
    });

    let totalRiskScore = 0;
    const assetRisks = Array.from(riskMap.entries()).map(
      ([assetId, riskScore]) => ({
        assetId,
        riskScore,
        criticality: criticalityMap.get(assetId) || 'low', // Include criticality
        scopeId: scopeMap.get(assetId) || null, // Include scopeId if available
      })
    );

    assetRisks.forEach(({ riskScore }) => {
      totalRiskScore += riskScore;
    });

    return {
      totalRiskScore,
      assetRisks,
    };
  } catch (error) {
    console.error('Error in calculateOverallRisk:', error);
    throw error;
  }
};

export const getOverallRisk = async (req, res) => {
  try {
    const overallRiskData = await CompletionStatus.calculateOverallRisk();
    res.status(200).json(overallRiskData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const CompletionStatus = mongoose.model(
  'CompletionStatus',
  CompletionStatusSchema
);

export default CompletionStatus;
