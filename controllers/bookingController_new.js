const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Pet = require('../models/Pet');
const User = require('../models/User');
const { sendBookingEmails } = require('../services/emailService');

// Import admin controller for real-time updates
const { broadcastNewBooking } = require('../../admin/controllers/adminController');
