const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Plan name is required'],
        trim: true,
        unique: true
    },
    price: {
        type: Number,
        required: [true, 'Plan price is required'],
        min: [0, 'Price cannot be negative']
    },
    duration: {
        type: Number, // in days
        required: [true, 'Plan duration is required'],
        default: 30
    },
    features: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
subscriptionPlanSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
