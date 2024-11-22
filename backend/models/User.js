import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Use bcryptjs for hashing

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        'Admin',
        'Executive',
        'Compliance Team',
        'IT Team',
        'Auditor',
        'External Auditor', // New role added here
        'user',
      ],
      default: 'user',
    },
    permissions: {
      view: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delegate: { type: Boolean, default: false },
      uploadEvidence: { type: Boolean, default: false },
      confirmEvidence: { type: Boolean, default: false },
    },
    hasCompletedCompanyForm: {
      type: Boolean,
      default: false,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyForm',
      default: null,
    },
  },
  { collection: 'users' }
);

/// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
  // Set permissions based on role
  const rolePermissions = {
    Admin: {
      view: true,
      add: true,
      edit: true,
      delegate: true,
      uploadEvidence: true,
      confirmEvidence: true,
    },
    Executive: { view: true },
    'Compliance Team': { view: true, add: true, edit: true, delegate: true },
    'IT Team': { view: true, edit: true, delegate: true, uploadEvidence: true },
    Auditor: { view: true, confirmEvidence: true },
    'External Auditor': { view: true, confirmEvidence: true }, // Permissions for External Auditor

    user: {
      view: false,
      add: false,
      edit: false,
      delegate: false,
      uploadEvidence: false,
      confirmEvidence: false,
    },
  };
  this.permissions = rolePermissions[this.role] || rolePermissions['user'];
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
