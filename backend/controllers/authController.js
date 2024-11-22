// backend/controllers/authController.js
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { AsyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Login route (updated for email login)
const login = AsyncHandler(async (req, res) => {
  const { email, username, password } = req.body; // Data being used to fetch user

  console.log('Attempting login with:', email || username);

  // Find user by email or username
  const user = await User.findOne({
    $or: [{ email }, { username }], // Query to fetch user from database
  });

  if (!user) {
    console.log('User not found');
    throw new ApiError(401, 'Invalid email/username ');
  }

  // Check if the password matches
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log('Password mismatch');
    throw new ApiError(401, 'Invalid email/username or password');
  }

  // Generate the token and send the response
  const token = generateToken(user);
  res.status(200).json(new ApiResponse(200, { token }, 'Login successful'));
});

// Get current user route
const getCurrentUser = AsyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, 'Current user retrieved successfully.'));
});

export { login, getCurrentUser };
