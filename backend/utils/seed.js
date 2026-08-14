require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seed = async () => {
  await connectDB();

  await User.deleteMany({ email: { $in: ['admin@clinic.com', 'dentist@clinic.com', 'patient@clinic.com'] } });

  await User.create([
    {
      name: 'Clinic Admin',
      email: 'admin@clinic.com',
      password: 'password123',
      role: 'admin',
    },
    {
      name: 'Dr. Jane Smith',
      email: 'dentist@clinic.com',
      password: 'password123',
      role: 'dentist',
      specialization: 'Orthodontics',
      licenseNumber: 'DDS-12345',
      workingHours: [
        { day: 'monday', start: '09:00', end: '17:00' },
        { day: 'tuesday', start: '09:00', end: '17:00' },
        { day: 'wednesday', start: '09:00', end: '13:00' },
      ],
    },
    {
      name: 'John Patient',
      email: 'patient@clinic.com',
      password: 'password123',
      role: 'patient',
      phone: '555-0100',
    },
  ]);

  console.log('Seed data created:');
  console.log('  admin@clinic.com / password123');
  console.log('  dentist@clinic.com / password123');
  console.log('  patient@clinic.com / password123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
