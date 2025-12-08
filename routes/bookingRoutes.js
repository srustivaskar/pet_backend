const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getUserBookings,
    getBookingById,
    createBooking,
    updateBooking,
    cancelBooking,
    getAvailableSlots
} = require('../controllers/bookingController');

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// Booking management routes
router.get('/', getUserBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.post('/:id/cancel', cancelBooking);

// Utility routes
router.get('/availability/slots', getAvailableSlots);

module.exports = router;
