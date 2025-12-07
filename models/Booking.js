const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Customer ID is required'],
        ref: 'User'
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Service ID is required'],
        ref: 'Service'
    },
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Pet ID is required'],
        ref: 'Pet'
    },
    bookingDate: {
        type: Date,
        required: [true, 'Booking date is required']
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Duration is required']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Price cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    specialRequests: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online', 'bank-transfer'],
        default: 'cash'
    },
    staffAssigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();

    // Set completedAt when status changes to completed
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = Date.now();
    }

    next();
});

// Index for better query performance
bookingSchema.index({ customerId: 1, bookingDate: -1 });
bookingSchema.index({ status: 1, bookingDate: 1 });
bookingSchema.index({ serviceId: 1, bookingDate: 1 });

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
    const now = new Date();
    const bookingTime = new Date(this.bookingDate);
    const hoursUntilBooking = (bookingTime - now) / (1000 * 60 * 60);

    // Can be cancelled if more than 2 hours away and status is not completed
    return hoursUntilBooking > 2 && this.status !== 'completed' && this.status !== 'cancelled';
};

// Instance method to calculate total hours
bookingSchema.methods.getTotalHours = function() {
    return this.duration / 60;
};

module.exports = mongoose.model('Booking', bookingSchema);
