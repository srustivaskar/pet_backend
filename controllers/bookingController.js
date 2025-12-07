const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Pet = require('../models/Pet');
const User = require('../models/User');
const { sendBookingEmails } = require('../services/emailService');

// Get all bookings for the authenticated user
exports.getUserBookings = async (req, res) => {
    try {
        const {
            status,
            page = 1,
            limit = 10,
            sortBy = 'bookingDate',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = { customerId: req.user.id };

        if (status) {
            filter.status = status;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(filter)
            .populate('serviceId', 'name price duration category')
            .populate('petId', 'name breed species')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        const total = await Booking.countDocuments(filter);

        res.json({
            success: true,
            data: bookings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalBookings: total,
                hasNextPage: parseInt(page) * parseInt(limit) < total,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching bookings'
        });
    }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findOne({
            _id: id,
            customerId: req.user.id
        })
        .populate('serviceId', 'name description price duration category image')
        .populate('petId', 'name breed age species color profileImage')
        .select('-__v');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error('Get booking by ID error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching booking'
        });
    }
};

// Create new booking
exports.createBooking = async (req, res) => {
    try {
        const {
            serviceId,
            petId,
            bookingDate,
            specialRequests,
            notes
        } = req.body;

        // Validation
        if (!serviceId || !petId || !bookingDate) {
            return res.status(400).json({
                success: false,
                message: 'Service ID, pet ID, and booking date are required'
            });
        }

        // Verify service exists and is active
        const service = await Service.findOne({ _id: serviceId, isActive: true });
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found or unavailable'
            });
        }

        // Verify pet exists and belongs to user
        const pet = await Pet.findOne({ _id: petId, ownerId: req.user.id, isActive: true });
        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found or access denied'
            });
        }

        // Check if booking date is in the future
        const bookingDateTime = new Date(bookingDate);
        if (bookingDateTime <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Booking date must be in the future'
            });
        }

        // Check for conflicting bookings (considering service duration)
        const serviceEndTime = new Date(bookingDateTime.getTime() + service.duration * 60000);

        const conflictingBooking = await Booking.findOne({
            petId,
            status: { $in: ['pending', 'confirmed', 'in-progress'] },
            $or: [
                {
                    // New booking starts during existing booking
                    bookingDate: { $lte: bookingDateTime },
                    $expr: {
                        $gt: [
                            { $add: ['$bookingDate', { $multiply: ['$duration', 60000] }] },
                            bookingDateTime
                        ]
                    }
                },
                {
                    // Existing booking starts during new booking
                    bookingDate: { $gte: bookingDateTime, $lt: serviceEndTime }
                }
            ]
        });

        if (conflictingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Pet already has a booking that conflicts with this time slot'
            });
        }

        const booking = new Booking({
            customerId: req.user.id,
            serviceId,
            petId,
            bookingDate: bookingDateTime,
            duration: service.duration,
            totalPrice: service.price,
            specialRequests: specialRequests?.trim(),
            notes: notes?.trim()
        });

        await booking.save();
        await booking.populate('serviceId', 'name price duration');
        await booking.populate('petId', 'name breed');

        // Get customer details for email notification
        const customer = await User.findById(req.user.id).select('name email phone');
        
        console.log('📧 Attempting to send email notifications...');
        console.log('📧 Customer email:', customer.email);
        
        // Send confirmation email to customer
        try {
            await sendBookingConfirmationEmail({
                booking,
                customer,
                pet,
                service
            });
            console.log('✅ Customer booking confirmation sent to:', customer.email);
        } catch (emailError) {
            console.error('❌ Failed to send customer confirmation:', emailError);
            // Continue with booking creation even if email fails
        }
        
        // Send notification email to admin
        try {
            await sendAdminBookingNotification({
                booking,
                customer,
                pet,
                service
            });
            console.log('✅ Admin booking notification sent successfully');
        } catch (emailError) {
            console.error('❌ Failed to send admin notification:', emailError);
            // Continue with booking creation even if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });

    } catch (error) {
        console.error('Create booking error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating booking'
        });
    }
};

// Update booking
exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.customerId;
        delete updates.createdAt;
        delete updates.__v;

        const booking = await Booking.findOneAndUpdate(
            { _id: id, customerId: req.user.id },
            { ...updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        )
        .populate('serviceId', 'name price duration')
        .populate('petId', 'name breed');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });

    } catch (error) {
        console.error('Update booking error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating booking'
        });
    }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findOne({
            _id: id,
            customerId: req.user.id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!booking.canBeCancelled()) {
            return res.status(400).json({
                success: false,
                message: 'Booking cannot be cancelled at this time'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while cancelling booking'
        });
    }
};

// Get available time slots for a service and date
exports.getAvailableSlots = async (req, res) => {
    try {
        const { serviceId, date } = req.query;

        if (!serviceId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Service ID and date are required'
            });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const bookingDate = new Date(date);
        const startOfDay = new Date(bookingDate.setHours(9, 0, 0, 0)); // Business starts at 9 AM
        const endOfDay = new Date(bookingDate.setHours(18, 0, 0, 0)); // Business ends at 6 PM

        // Get all bookings for this service on this date
        const existingBookings = await Booking.find({
            serviceId,
            bookingDate: {
                $gte: startOfDay,
                $lt: endOfDay
            },
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        }).select('bookingDate duration');

        // Generate available slots (every 30 minutes)
        const availableSlots = [];
        const slotDuration = 30; // 30 minutes per slot

        for (let time = new Date(startOfDay); time < endOfDay; time.setMinutes(time.getMinutes() + slotDuration)) {
            const slotEnd = new Date(time.getTime() + service.duration * 60000);

            // Check if this slot conflicts with any existing booking
            const hasConflict = existingBookings.some(booking => {
                const bookingStart = new Date(booking.bookingDate);
                const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);

                return (time < bookingEnd && slotEnd > bookingStart);
            });

            if (!hasConflict && slotEnd <= endOfDay) {
                availableSlots.push({
                    startTime: new Date(time),
                    endTime: slotEnd,
                    available: true
                });
            }
        }

        res.json({
            success: true,
            data: {
                service: {
                    id: service._id,
                    name: service.name,
                    duration: service.duration
                },
                date: bookingDate,
                availableSlots
            }
        });

    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching available slots'
        });
    }
};
