import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    const mongoUri = 'mongodb+srv://admin:qwerTy_@hipaa.5dfhx.mongodb.net'; // Provide the MongoDB URI directly here
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'adminpassword', // Ensure to hash the password in the User model
      role: 'Admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.disconnect();
  }
};

createAdminUser();
