const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Customer ID is required'],
        ref: 'User',
        unique: true
    },
    planType: {
        type: String,
        required: [true, 'Plan type is required'],
        enum: ['basic', 'premium', 'enterprise']
    },
    planName: {
        type: String,
        required: [true, 'Plan name is required']
    },
    price: {
        type: Number,
        required: [true, 'Plan price is required'],
        min: [0, 'Price cannot be negative']
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        default: 'monthly'
    },
    features: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        included: {
            type: Boolean,
            default: true
        },
        limit: {
            type: Number,
            default: -1 // -1 means unlimited
        }
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'expired', 'suspended'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    nextBillingDate: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'paypal', 'bank-transfer'],
        default: 'card'
    },
    autoRenew: {
        type: Boolean,
        default: true
    },
    usageStats: {
        servicesUsed: {
            type: Number,
            default: 0
        },
        petsRegistered: {
            type: Number,
            default: 0
        },
        bookingsMade: {
            type: Number,
            default: 0
        }
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
subscriptionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for better query performance
subscriptionSchema.index({ customerId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });

// Instance method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
    return this.status === 'active' && new Date() <= this.endDate;
};

// Instance method to get days until expiry
subscriptionSchema.methods.daysUntilExpiry = function() {
    const now = new Date();
    const endDate = new Date(this.endDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

// Instance method to check if feature is available
subscriptionSchema.methods.hasFeature = function(featureName) {
    const feature = this.features.find(f => f.name === featureName);
    return feature && feature.included;
};

// Instance method to get feature limit
subscriptionSchema.methods.getFeatureLimit = function(featureName) {
    const feature = this.features.find(f => f.name === featureName);
    return feature ? feature.limit : 0;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
