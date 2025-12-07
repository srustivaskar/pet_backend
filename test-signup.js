require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const request = require('supertest');

// Import the server and routes
const app = express();
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));

// Connect to database before testing
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for testing...');
        
        // Test the signup endpoint
        const testUser = {
            username: 'testuser123',
            email: 'testuser123@example.com',
            password: 'testpass123'
        };

        console.log('Testing signup with user:', testUser);
        
        const response = await request(app)
            .post('/api/auth/signup')
            .send(testUser);
            
        console.log('Response status:', response.status);
        console.log('Response body:', response.body);
        
        // Check if user was actually saved
        const User = require('./models/User');
        const savedUser = await User.findOne({ email: testUser.email });
        if (savedUser) {
            console.log('User successfully saved to database!');
            console.log('Saved user ID:', savedUser._id);
        } else {
            console.log('User was NOT saved to database!');
        }
        
        await mongoose.connection.close();
        
    } catch (err) {
        console.error('Test error:', err);
        process.exit(1);
    }
};

connectDB();
