const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
    getUserSubscription,
    getSubscriptionById,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    getSubscriptionPlans,
    updateUsageStats
} = require('../controllers/subscriptionController');

const router = express.Router();

// All subscription routes require authentication
router.use(authMiddleware);

// Subscription management routes
router.get('/', getUserSubscription);
router.get('/:id', getSubscriptionById);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.post('/:id/cancel', cancelSubscription);
router.put('/:id/usage', updateUsageStats);

// Public route for getting available plans
router.get('/plans/all', getSubscriptionPlans);

module.exports = router;
