const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (patient by default; dentist/admin creation is restricted)
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join('. '));
  }

  const { name, email, password, phone, role, specialization, licenseNumber } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  // Only allow public self-registration as patient or dentist.
  // Admin accounts should be created by an existing admin via /api/users (protected route).
  const allowedSelfRoles = ['patient', 'dentist'];
  const finalRole = allowedSelfRoles.includes(role) ? role : 'patient';

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: finalRole,
    specialization: finalRole === 'dentist' ? specialization : undefined,
    licenseNumber: finalRole === 'dentist' ? licenseNumber : undefined,
  });

  res.status(201).json({
    success: true,
    data: {
      user,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Account is deactivated. Contact the clinic administrator.');
  }

  res.json({
    success: true,
    data: {
      user,
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get currently logged in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { register, login, getMe };
