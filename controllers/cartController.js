const Cart = require("../models/Cart");

exports.addToCart = async (req, res) => {
    try {
        const { productId, name, price, quantity = 1, image = '' } = req.body;

        // Validation
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Product name is required"
            });
        }

        if (!price || price < 0) {
            return res.status(400).json({
                success: false,
                message: "Valid product price is required"
            });
        }

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        // Find or create cart for user
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            cart = new Cart({
                userId: req.user.id,
                items: []
            });
        }

        // Add item to cart using the model method
        await cart.addItem(productId, name.trim(), price, quantity, image);

        // Populate the cart with user information for response
        await cart.populate('userId', 'username email');

        res.json({
            success: true,
            message: "Item added to cart successfully",
            cart: {
                id: cart._id,
                items: cart.items,
                totalItems: cart.totalItems,
                totalPrice: cart.totalPrice,
                updatedAt: cart.updatedAt
            }
        });

    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error while adding item to cart"
        });
    }
};

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id })
            .populate('userId', 'username email')
            .populate('items.productId', 'name price image');

        if (!cart) {
            return res.json({
                success: true,
                items: [],
                totalItems: 0,
                totalPrice: 0
            });
        }

        res.json({
            success: true,
            id: cart._id,
            items: cart.items,
            totalItems: cart.totalItems,
            totalPrice: cart.totalPrice,
            updatedAt: cart.updatedAt
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error while fetching cart"
        });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity cannot be negative"
            });
        }

        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        await cart.updateItemQuantity(productId, quantity);

        res.json({
            success: true,
            message: "Cart item updated successfully",
            cart: {
                id: cart._id,
                items: cart.items,
                totalItems: cart.totalItems,
                totalPrice: cart.totalPrice
            }
        });

    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error while updating cart item"
        });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        await cart.removeItem(productId);

        res.json({
            success: true,
            message: "Item removed from cart successfully",
            cart: {
                id: cart._id,
                items: cart.items,
                totalItems: cart.totalItems,
                totalPrice: cart.totalPrice
            }
        });

    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error while removing item from cart"
        });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        await cart.clearCart();

        res.json({
            success: true,
            message: "Cart cleared successfully",
            cart: {
                id: cart._id,
                items: [],
                totalItems: 0,
                totalPrice: 0
            }
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error while clearing cart"
        });
    }
};
