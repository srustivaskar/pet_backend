const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    image: {
        type: String,
        default: ''
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        unique: true
    },
    items: [cartItemSchema],
    totalItems: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
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

// Update timestamps before saving
cartSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    next();
});

// Instance method to add item to cart
cartSchema.methods.addItem = function(productId, name, price, quantity = 1, image = '') {
    const existingItemIndex = this.items.findIndex(
        item => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
        this.items[existingItemIndex].quantity += quantity;
    } else {
        this.items.push({ productId, name, price, quantity, image });
    }

    return this.save();
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(productId) {
    this.items = this.items.filter(
        item => item.productId.toString() !== productId.toString()
    );
    return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
    const itemIndex = this.items.findIndex(
        item => item.productId.toString() === productId.toString()
    );

    if (itemIndex > -1) {
        if (quantity <= 0) {
            this.items.splice(itemIndex, 1);
        } else {
            this.items[itemIndex].quantity = quantity;
        }
    }

    return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
    this.items = [];
    return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
