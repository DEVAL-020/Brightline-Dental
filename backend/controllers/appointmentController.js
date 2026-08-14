const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Helper: check if [startTime, endTime) overlaps an existing active appointment for the dentist that day
const hasConflict = async ({ dentist, date, startTime, endTime, excludeId }) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const query = {
    dentist,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ['pending', 'confirmed'] },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const sameDayAppointments = await Appointment.find(query);

  return sameDayAppointments.some((appt) => {
    // Overlap if new start is before existing end AND new end is after existing start
    return startTime < appt.endTime && endTime > appt.startTime;
  });
};

// @desc    Get already-booked time ranges for a dentist on a given date
//          (used by the frontend to grey out taken slots). Only exposes
//          start/end times, never patient identity, so any authenticated
//          user can safely call it.
// @route   GET /api/appointments/availability?dentist=<id>&date=<YYYY-MM-DD>
// @access  Private
const getAvailability = asyncHandler(async (req, res) => {
  const { dentist, date, excludeId } = req.query;
  if (!dentist || !date) {
    res.status(400);
    throw new Error('dentist and date query parameters are required');
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const query = {
    dentist,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ['pending', 'confirmed'] },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const booked = await Appointment.find(query).select('startTime endTime -_id');

  res.json({ success: true, data: booked });
});

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private/Patient (or Admin booking on behalf of a patient)
const createAppointment = asyncHandler(async (req, res) => {
  const { dentist, date, startTime, endTime, reason, notes } = req.body;
  // Patients book for themselves; admins may specify a patient id
  const patient = req.user.role === 'admin' && req.body.patient ? req.body.patient : req.user._id;

  if (!dentist || !date || !startTime || !endTime || !reason) {
    res.status(400);
    throw new Error('dentist, date, startTime, endTime and reason are required');
  }

  if (endTime <= startTime) {
    res.status(400);
    throw new Error('endTime must be after startTime');
  }

  const dentistUser = await User.findOne({ _id: dentist, role: 'dentist', isActive: true });
  if (!dentistUser) {
    res.status(404);
    throw new Error('Dentist not found or inactive');
  }

  const appointmentDate = new Date(date);
  if (appointmentDate < new Date().setHours(0, 0, 0, 0)) {
    res.status(400);
    throw new Error('Cannot book an appointment in the past');
  }

  const conflict = await hasConflict({ dentist, date: appointmentDate, startTime, endTime });
  if (conflict) {
    res.status(409);
    throw new Error('This time slot is no longer available for the selected dentist');
  }

  const appointment = await Appointment.create({
    patient,
    dentist,
    date: appointmentDate,
    startTime,
    endTime,
    reason,
    notes: notes ? String(notes).trim() : undefined,
  });

  const populated = await appointment.populate([
    { path: 'patient', select: 'name email phone' },
    { path: 'dentist', select: 'name email specialization' },
  ]);

  res.status(201).json({ success: true, data: populated });
});

// @desc    Get appointments (patients see their own, dentists see their own, admins see all)
// @route   GET /api/appointments?status=&from=&to=
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === 'patient') filter.patient = req.user._id;
  if (req.user.role === 'dentist') filter.dentist = req.user._id;
  // admin: no restriction, sees all

  if (req.query.status) filter.status = req.query.status;
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
  }

  const appointments = await Appointment.find(filter)
    .populate('patient', 'name email phone')
    .populate('dentist', 'name email specialization')
    .sort({ date: 1, startTime: 1 });

  res.json({ success: true, count: appointments.length, data: appointments });
});

// @desc    Get a single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private (owner patient, owner dentist, or admin)
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name email phone')
    .populate('dentist', 'name email specialization');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const isOwner =
    (Boolean(appointment.patient) && appointment.patient._id.toString() === req.user._id.toString()) ||
    (Boolean(appointment.dentist) && appointment.dentist._id.toString() === req.user._id.toString());

  if (req.user.role !== 'admin' && !isOwner) {
    res.status(403);
    throw new Error('Not authorized to view this appointment');
  }

  res.json({ success: true, data: appointment });
});

// @desc    Update appointment (reschedule, change status, add notes)
// @route   PATCH /api/appointments/:id
// @access  Private (owner patient can cancel/reschedule; dentist/admin can confirm/complete/cancel)
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const isPatientOwner = Boolean(appointment.patient) && appointment.patient.toString() === req.user._id.toString();
  const isDentistOwner = Boolean(appointment.dentist) && appointment.dentist.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isPatientOwner && !isDentistOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update this appointment');
  }

  const { date, startTime, endTime, reason, status, notes, cancellationReason } = req.body;

  // Patients may only reschedule or cancel their own pending appointments
  if (isPatientOwner && !isAdmin && !isDentistOwner) {
    if (status && status !== 'cancelled') {
      res.status(403);
      throw new Error('Patients may only cancel appointments, not change status directly');
    }
    if (appointment.status !== 'pending' && (date || startTime || endTime)) {
      res.status(400);
      throw new Error('Only pending appointments can be rescheduled');
    }
  }

  // Dentists may only update status/notes, not reassign patient/dentist
  if (isDentistOwner && !isAdmin) {
    if (req.body.patient || req.body.dentist) {
      res.status(403);
      throw new Error('Dentists cannot reassign patient or dentist on an appointment');
    }
  }

  // `notes` holds internal clinical notes maintained by the dentist/admin.
  // Patients may set it once at booking time (see createAppointment) but
  // must not be able to overwrite it afterwards.
  if (isPatientOwner && !isAdmin && !isDentistOwner && notes !== undefined) {
    res.status(403);
    throw new Error('Patients cannot edit appointment notes');
  }

  // If rescheduling, re-check conflicts
  if (date || startTime || endTime) {
    const newDate = date ? new Date(date) : appointment.date;
    const newStart = startTime || appointment.startTime;
    const newEnd = endTime || appointment.endTime;

    if (newEnd <= newStart) {
      res.status(400);
      throw new Error('endTime must be after startTime');
    }

    const conflict = await hasConflict({
      dentist: appointment.dentist,
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      excludeId: appointment._id,
    });
    if (conflict) {
      res.status(409);
      throw new Error('The requested time slot is unavailable');
    }

    appointment.date = newDate;
    appointment.startTime = newStart;
    appointment.endTime = newEnd;
    appointment.status = 'pending'; // rescheduling resets to pending for re-confirmation
  }

  if (reason) appointment.reason = reason;
  if (notes !== undefined) appointment.notes = notes;
  if (status) appointment.status = status;
  if (cancellationReason !== undefined) appointment.cancellationReason = cancellationReason;

  await appointment.save();

  const populated = await appointment.populate([
    { path: 'patient', select: 'name email phone' },
    { path: 'dentist', select: 'name email specialization' },
  ]);

  res.json({ success: true, data: populated });
});

// @desc    Permanently delete an appointment record
// @route   DELETE /api/appointments/:id
// @access  Private/Admin
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  res.json({ success: true, message: 'Appointment deleted' });
});

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAvailability,
};
