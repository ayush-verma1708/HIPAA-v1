// seedAdmin.js
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

const MONGO_URI = 'mongodb+srv://admin:qwerTy_@hipaa.5dfhx.mongodb.net';

async function createAdminUser() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return;
    }

    const adminPassword = await bcrypt.hash('admin_password', 10);

    const adminUser = new User({
      username: 'admin',
      password: adminPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser();
