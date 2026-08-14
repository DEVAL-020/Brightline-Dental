const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      // Calendar date of the appointment (time portion ignored, use startTime/endTime)
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    startTime: {
      // "HH:mm" 24-hour format
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'startTime must be in HH:mm format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'endTime must be in HH:mm format'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for visit is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
    },
    notes: {
      // Internal notes added by dentist/admin
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent exact duplicate double-booking of the same dentist/date/startTime
appointmentSchema.index({ dentist: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
