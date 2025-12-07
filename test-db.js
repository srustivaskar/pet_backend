require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully!');
        
        // Test if we can access the User model
        const User = require('./models/User');
        console.log('User model loaded successfully');
        
        // Test creating a user (but don't save)
        const testUser = new User({
            username: 'test',
            email: 'test@test.com',
            password: 'testpass123'
        });
        console.log('User model validation:', testUser.validateSync());
        
        // Check existing users
        const count = await User.countDocuments();
        console.log(`Current users in database: ${count}`);
        
        await mongoose.connection.close();
        console.log('Database connection closed');
        
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

connectDB();
