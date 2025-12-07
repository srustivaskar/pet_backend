const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');

// Get user's subscription
exports.getUserSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            customerId: req.user.id,
            status: { $in: ['active', 'inactive'] }
        }).populate('customerId', 'username email');

        if (!subscription) {
            return res.json({
                success: true,
                message: 'No active subscription found',
                data: null
            });
        }

        res.json({
            success: true,
            data: subscription
        });

    } catch (error) {
        console.error('Get user subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching subscription'
        });
    }
};

// Get subscription by ID
exports.getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;

        const subscription = await Subscription.findOne({
            _id: id,
            customerId: req.user.id
        }).populate('customerId', 'username email');

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        res.json({
            success: true,
            data: subscription
        });

    } catch (error) {
        console.error('Get subscription by ID error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching subscription'
        });
    }
};

// Create new subscription
exports.createSubscription = async (req, res) => {
    try {
        const {
            planType,
            planName,
            price,
            billingCycle,
            features,
            paymentMethod,
            autoRenew
        } = req.body;

        // Validation
        if (!planType || !planName || !price || !billingCycle) {
            return res.status(400).json({
                success: false,
                message: 'Plan type, name, price, and billing cycle are required'
            });
        }

        // Check if user already has an active subscription
        const existingSubscription = await Subscription.findOne({
            customerId: req.user.id,
            status: 'active'
        });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: 'User already has an active subscription'
            });
        }

        // Calculate dates based on billing cycle
        const now = new Date();
        let endDate = new Date(now);
        let nextBillingDate = new Date(now);

        switch (billingCycle) {
            case 'monthly':
                endDate.setMonth(endDate.getMonth() + 1);
                nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                break;
            case 'quarterly':
                endDate.setMonth(endDate.getMonth() + 3);
                nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
                break;
            case 'yearly':
                endDate.setFullYear(endDate.getFullYear() + 1);
                nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid billing cycle'
                });
        }

        const subscription = new Subscription({
            customerId: req.user.id,
            planType,
            planName,
            price: parseFloat(price),
            billingCycle,
            features: features || [],
            paymentMethod: paymentMethod || 'card',
            autoRenew: autoRenew !== undefined ? autoRenew : true,
            endDate,
            nextBillingDate
        });

        await subscription.save();

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription
        });

    } catch (error) {
        console.error('Create subscription error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating subscription'
        });
    }
};

// Update subscription
exports.updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.customerId;
        delete updates.createdAt;
        delete updates.__v;

        const subscription = await Subscription.findOneAndUpdate(
            { _id: id, customerId: req.user.id },
            { ...updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        res.json({
            success: true,
            message: 'Subscription updated successfully',
            data: subscription
        });

    } catch (error) {
        console.error('Update subscription error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating subscription'
        });
    }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancelImmediately = false } = req.body;

        const subscription = await Subscription.findOne({
            _id: id,
            customerId: req.user.id
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (subscription.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Subscription is already cancelled'
            });
        }

        if (cancelImmediately) {
            subscription.status = 'cancelled';
            subscription.autoRenew = false;
        } else {
            // Cancel at the end of current billing period
            subscription.autoRenew = false;
            subscription.status = 'active'; // Keep active until end date
        }

        await subscription.save();

        res.json({
            success: true,
            message: cancelImmediately ? 'Subscription cancelled immediately' : 'Subscription will be cancelled at the end of billing period',
            data: subscription
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while cancelling subscription'
        });
    }
};

// Get subscription plans (available plans)
exports.getSubscriptionPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find({ isActive: true })
            .select('-__v')
            .sort({ price: 1 });

        res.json({
            success: true,
            data: plans
        });

    } catch (error) {
        console.error('Get subscription plans error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching subscription plans'
        });
    }
};

// Update usage stats
exports.updateUsageStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { servicesUsed, petsRegistered, bookingsMade } = req.body;

        const updates = {};
        if (servicesUsed !== undefined) updates['usageStats.servicesUsed'] = servicesUsed;
        if (petsRegistered !== undefined) updates['usageStats.petsRegistered'] = petsRegistered;
        if (bookingsMade !== undefined) updates['usageStats.bookingsMade'] = bookingsMade;

        const subscription = await Subscription.findOneAndUpdate(
            { _id: id, customerId: req.user.id },
            updates,
            { new: true }
        );

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        res.json({
            success: true,
            message: 'Usage stats updated successfully',
            data: subscription
        });

    } catch (error) {
        console.error('Update usage stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating usage stats'
        });
    }
};
