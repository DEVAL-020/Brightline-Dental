const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  getDentists,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public: browse dentists to pick from when booking
router.get('/dentists', getDentists);

// Admin-only user management
router.use(protect, restrictTo('admin'));

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUserById).patch(updateUser).delete(deactivateUser);

module.exports = router;
