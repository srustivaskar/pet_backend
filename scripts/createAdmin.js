const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Create admin user
const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'sandhyavaskar1@gmail.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const adminData = {
            username: 'admin',
            name: 'System Administrator',
            email: 'sandhyavaskar1@gmail.com',
            password: 'admin123456',
            role: 'admin',
            isActive: true,
            age: 25,
            phoneNumber: '1234567890'
        };

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

        // Create admin
        const admin = new User({
            ...adminData,
            password: hashedPassword
        });

        await admin.save();
        console.log('Admin user created successfully!');
        console.log('Email: sandhyavaskar1@gmail.com');
        console.log('Password: admin123456');
        console.log('Please change the password after first login');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createAdmin();
