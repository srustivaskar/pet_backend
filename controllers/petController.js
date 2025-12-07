const Pet = require('../models/Pet');

// Get all pets for the authenticated user
exports.getUserPets = async (req, res) => {
    try {
        const pets = await Pet.find({
            ownerId: req.user.id,
            isActive: true
        })
        .sort({ createdAt: -1 })
        .select('-__v');

        res.json({
            success: true,
            data: pets,
            count: pets.length
        });

    } catch (error) {
        console.error('Get user pets error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching pets'
        });
    }
};

// Get pet by ID
exports.getPetById = async (req, res) => {
    try {
        const { id } = req.params;

        const pet = await Pet.findOne({
            _id: id,
            ownerId: req.user.id,
            isActive: true
        }).select('-__v');

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        res.json({
            success: true,
            data: pet
        });

    } catch (error) {
        console.error('Get pet by ID error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid pet ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching pet'
        });
    }
};

// Create new pet
exports.createPet = async (req, res) => {
    try {
        const {
            name,
            breed,
            age,
            weight,
            gender,
            species,
            color,
            specialInstructions,
            profileImage
        } = req.body;

        // Validation
        if (!name || !breed || !age || !species) {
            return res.status(400).json({
                success: false,
                message: 'Name, breed, age, and species are required'
            });
        }

        const pet = new Pet({
            name: name.trim(),
            ownerId: req.user.id,
            breed: breed.trim(),
            age: parseInt(age),
            weight: weight ? parseFloat(weight) : undefined,
            gender: gender || 'unknown',
            species,
            color: color?.trim(),
            specialInstructions: specialInstructions?.trim(),
            profileImage: profileImage || ''
        });

        await pet.save();

        res.status(201).json({
            success: true,
            message: 'Pet profile created successfully',
            data: pet
        });

    } catch (error) {
        console.error('Create pet error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating pet profile'
        });
    }
};

// Update pet
exports.updatePet = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.ownerId;
        delete updates.createdAt;
        delete updates.__v;

        const pet = await Pet.findOneAndUpdate(
            { _id: id, ownerId: req.user.id },
            { ...updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        res.json({
            success: true,
            message: 'Pet profile updated successfully',
            data: pet
        });

    } catch (error) {
        console.error('Update pet error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid pet ID format'
            });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating pet profile'
        });
    }
};

// Delete pet (soft delete)
exports.deletePet = async (req, res) => {
    try {
        const { id } = req.params;

        const pet = await Pet.findOneAndUpdate(
            { _id: id, ownerId: req.user.id },
            { isActive: false },
            { new: true }
        );

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        res.json({
            success: true,
            message: 'Pet profile deactivated successfully'
        });

    } catch (error) {
        console.error('Delete pet error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid pet ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting pet profile'
        });
    }
};

// Add medical record
exports.addMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { condition, date, notes } = req.body;

        if (!condition) {
            return res.status(400).json({
                success: false,
                message: 'Medical condition is required'
            });
        }

        const pet = await Pet.findOneAndUpdate(
            { _id: id, ownerId: req.user.id },
            {
                $push: {
                    medicalHistory: {
                        condition: condition.trim(),
                        date: date ? new Date(date) : Date.now(),
                        notes: notes?.trim()
                    }
                }
            },
            { new: true }
        );

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        res.json({
            success: true,
            message: 'Medical record added successfully',
            data: pet
        });

    } catch (error) {
        console.error('Add medical record error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while adding medical record'
        });
    }
};

// Add vaccination record
exports.addVaccination = async (req, res) => {
    try {
        const { id } = req.params;
        const { vaccine, date, nextDue, notes } = req.body;

        if (!vaccine || !date) {
            return res.status(400).json({
                success: false,
                message: 'Vaccine name and date are required'
            });
        }

        const pet = await Pet.findOneAndUpdate(
            { _id: id, ownerId: req.user.id },
            {
                $push: {
                    vaccinations: {
                        vaccine: vaccine.trim(),
                        date: new Date(date),
                        nextDue: nextDue ? new Date(nextDue) : undefined,
                        notes: notes?.trim()
                    }
                }
            },
            { new: true }
        );

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        res.json({
            success: true,
            message: 'Vaccination record added successfully',
            data: pet
        });

    } catch (error) {
        console.error('Add vaccination error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while adding vaccination record'
        });
    }
};
