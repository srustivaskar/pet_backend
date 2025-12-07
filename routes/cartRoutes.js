const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

// Cart management routes
router.post("/add", addToCart);
router.get("/", getCart);
router.put("/update", updateCartItem);
router.post("/remove", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
