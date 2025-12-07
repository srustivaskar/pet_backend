require('dotenv').config();
const mongoose = require('mongoose');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for testing...');
        
        // Import the User model directly
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        
        // Test creating a user directly
        const testUser = {
            username: 'testuser456',
            email: 'testuser456@example.com',
            password: 'testpass123'
        };

        console.log('Testing direct user creation...');
        
        // Hash password like in the controller
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(testUser.password, saltRounds);
        
        // Create user instance
        const user = new User({
            username: testUser.username,
            email: testUser.email.toLowerCase(),
            password: hashedPassword
        });
        
        // Save user
        const savedUser = await user.save();
        console.log('User successfully saved to database!');
        console.log('Saved user ID:', savedUser._id);
        console.log('Saved user username:', savedUser.username);
        console.log('Saved user email:', savedUser.email);
        
        // Verify user exists in database
        const foundUser = await User.findOne({ email: testUser.email });
        if (foundUser) {
            console.log('User verification: SUCCESS - User found in database');
        } else {
            console.log('User verification: FAILED - User not found in database');
        }
        
        // Clean up - remove test user
        await User.deleteOne({ email: testUser.email });
        console.log('Test user cleaned up');
        
        await mongoose.connection.close();
        console.log('Database connection closed');
        
    } catch (err) {
        console.error('Test error:', err);
        process.exit(1);
    }
};

connectDB();
