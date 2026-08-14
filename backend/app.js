const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();


app.set('trust proxy', 1);

// Security & parsing middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : '*',
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongoSanitize());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', generalLimiter);


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/auth', authLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Dental Appointment API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
