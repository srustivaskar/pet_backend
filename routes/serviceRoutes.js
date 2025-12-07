const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
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
router.post('/', authMiddleware, createService);
router.put('/:id', authMiddleware, updateService);
router.delete('/:id', authMiddleware, deleteService);

module.exports = router;
