const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all users (optionally filter by role)
// @route   GET /api/users?role=patient
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, data: users });
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

// @desc    Admin creates a user of any role (e.g. dentist, admin, patient)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, specialization, licenseNumber, workingHours } = req.body;

  if (!name || !String(name).trim()) {
    res.status(400);
    throw new Error('Name is required');
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400);
    throw new Error('A valid email is required');
  }
  if (!password || String(password).length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }
  const allowedRoles = ['patient', 'dentist', 'admin'];
  if (role && !allowedRoles.includes(role)) {
    res.status(400);
    throw new Error(`Role must be one of: ${allowedRoles.join(', ')}`);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    specialization,
    licenseNumber,
    workingHours,
  });

  res.status(201).json({ success: true, data: user });
});

// @desc    Update a user (admin can update any field; users update via /auth or dedicated profile route)
// @route   PATCH /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  // Whitelist updatable fields explicitly rather than trusting the whole body,
  // to avoid mass-assignment of unexpected/internal fields (e.g. _id, timestamps).
  const allowedFields = [
    'name',
    'email',
    'phone',
    'role',
    'specialization',
    'licenseNumber',
    'workingHours',
    'dateOfBirth',
    'address',
    'isActive',
  ];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, data: user });
});

// @desc    Deactivate (soft-delete) a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, message: 'User deactivated', data: user });
});

// @desc    Public listing of active dentists (for patients to browse when booking)
// @route   GET /api/users/dentists
// @access  Public
const getDentists = asyncHandler(async (req, res) => {
  const dentists = await User.find({ role: 'dentist', isActive: true }).select(
    'name email phone specialization workingHours'
  );
  res.json({ success: true, count: dentists.length, data: dentists });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  getDentists,
};
