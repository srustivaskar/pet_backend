const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAllServices,
    getServiceById,
    getServicesByCategory,
    createService,
    updateService,
    deleteService
} = require('../controllers/serviceController');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.get('/category/:category', getServicesByCategory);

// Protected routes (authentication required)
router.post('/', protect, admin, createService);
router.put('/:id', protect, admin, updateService);
router.delete('/:id', protect, admin, deleteService);

module.exports = router;
