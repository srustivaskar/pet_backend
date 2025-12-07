const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Pet name is required'],
        trim: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Owner ID is required'],
        ref: 'User'
    },
    breed: {
        type: String,
        required: [true, 'Pet breed is required'],
        trim: true
    },
    age: {
        type: Number,
        required: [true, 'Pet age is required'],
        min: [0, 'Age cannot be negative'],
        max: [30, 'Age seems unrealistic']
    },
    weight: {
        type: Number,
        min: [0.1, 'Weight must be at least 0.1 kg']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unknown'],
        default: 'unknown'
    },
    species: {
        type: String,
        required: [true, 'Pet species is required'],
        enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'other'],
        default: 'dog'
    },
    color: {
        type: String,
        trim: true
    },
    medicalHistory: [{
        condition: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String,
            trim: true
        }
    }],
    vaccinations: [{
        vaccine: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: Date,
            required: true
        },
        nextDue: {
            type: Date
        },
        notes: {
            type: String,
            trim: true
        }
    }],
    allergies: [{
        type: String,
        trim: true
    }],
    medications: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        dosage: {
            type: String,
            trim: true
        },
        frequency: {
            type: String,
            trim: true
        },
        instructions: {
            type: String,
            trim: true
        }
    }],
    specialInstructions: {
        type: String,
        trim: true
    },
    profileImage: {
        type: String,
        default: ''
    },
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
petSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for better query performance
petSchema.index({ ownerId: 1, isActive: 1 });
petSchema.index({ species: 1, breed: 1 });

module.exports = mongoose.model('Pet', petSchema);
