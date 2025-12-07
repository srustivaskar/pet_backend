const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Service description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Service price is required'],
        min: [0, 'Price cannot be negative']
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Service duration is required'],
        min: [15, 'Duration must be at least 15 minutes']
    },
    category: {
        type: String,
        required: [true, 'Service category is required'],
        enum: ['grooming', 'walking', 'training', 'veterinary', 'boarding', 'exercise', 'health', 'care', 'other']
    },
    image: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    features: [{
        type: String,
        trim: true
    }],
    requirements: [{
        type: String,
        trim: true
    }],
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
serviceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for better search performance
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
