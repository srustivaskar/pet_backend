const Service = require('../models/Service');

// Get all services with optional filtering
exports.getAllServices = async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            search,
            page = 1,
            limit = 10,
            sortBy = 'name',
            sortOrder = 'asc'
        } = req.query;

        // Build filter object
        const filter = { isActive: true };

        if (category) {
            filter.category = category;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        if (search) {
            filter.$text = { $search: search };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const services = await Service.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        const total = await Service.countDocuments(filter);

        res.json({
            success: true,
            data: services,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalServices: total,
                hasNextPage: parseInt(page) * parseInt(limit) < total,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Get all services error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching services'
        });
    }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findOne({ _id: id, isActive: true })
            .select('-__v');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            data: service
        });

    } catch (error) {
        console.error('Get service by ID error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching service'
        });
    }
};

// Get services by category
exports.getServicesByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const services = await Service.find({
            category: category,
            isActive: true
        }).select('-__v');

        res.json({
            success: true,
            data: services,
            count: services.length
        });

    } catch (error) {
        console.error('Get services by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching services by category'
        });
    }
};

// Create new service (Admin only)
exports.createService = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            duration,
            category,
            image,
            features,
            requirements
        } = req.body;

        // Validation
        if (!name || !description || !price || !duration || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, price, duration, and category are required'
            });
        }

        // Check if service with same name already exists
        const existingService = await Service.findOne({ name: name.trim() });
        if (existingService) {
            return res.status(400).json({
                success: false,
                message: 'Service with this name already exists'
            });
        }

        const service = new Service({
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            duration: parseInt(duration),
            category,
            image: image || '',
            features: features || [],
            requirements: requirements || []
        });

        await service.save();

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });

    } catch (error) {
        console.error('Create service error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Service with this name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating service'
        });
    }
};

// Update service (Admin only)
exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.createdAt;
        delete updates.__v;

        const service = await Service.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });

    } catch (error) {
        console.error('Update service error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating service'
        });
    }
};

// Delete service (Admin only)
exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            message: 'Service deactivated successfully'
        });

    } catch (error) {
        console.error('Delete service error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting service'
        });
    }
};
