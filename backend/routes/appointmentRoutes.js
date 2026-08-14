const express = require('express');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailability,
} = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // all appointment routes require authentication

// Must come before '/:id' or Express would treat 'availability' as an :id param
router.get('/availability', getAvailability);

router
  .route('/')
  .get(getAppointments)
  .post(restrictTo('patient', 'admin'), createAppointment);

router
  .route('/:id')
  .get(getAppointmentById)
  .patch(updateAppointment) // fine-grained authorization handled in controller
  .delete(restrictTo('admin'), deleteAppointment);

module.exports = router;
