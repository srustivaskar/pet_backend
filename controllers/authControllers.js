const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Input validation helper
const validateEmail = (email) => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

exports.signup = async (req, res) => {
    try {
        const { username, email, password, name, age, owner, phoneNumber, dogAge } = req.body;

        // Validation
        if (!username || username.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Username must be at least 3 characters long"
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username }
            ]
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    message: "User with this email already exists"
                });
            }
            if (existingUser.username === username) {
                return res.status(400).json({
                    success: false,
                    message: "Username is already taken"
                });
            }
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = new User({
            username,
            name,
            age,
            owner,
            phoneNumber,
            dogAge,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'user' // Force role to 'user' for regular signup
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
            console.error('Signup error:', error);
            if (error.code === 11000) {
                // Duplicate key error
                const field = Object.keys(error.keyValue)[0];
                return res.status(400).json({
                    success: false,
                    message: `${field} already exists`
                });
            }
            res.status(500).json({
                success: false,
                message: "Internal server error during signup"
            });
        }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Login attempt:', { username, email });

        // Validation
        if ((!username && !email) || !password) {
            console.log('Validation failed: Missing credentials');
            return res.status(400).json({
                success: false,
                message: "Username/email and password are required"
            });
        }

        // Build query based on provided credentials
        const query = {};
        if (username) {
            query.username = username;
        } else if (email) {
            query.email = email.toLowerCase();
        }

        // Find user by username or email
        const user = await User.findOne(query);
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            console.log('User not found with query:', query);
            return res.status(401).json({
                success: false,
                message: "Invalid username/email or password"
            });
        }

        // Check if user is active
        if (user.isActive === false) {
            console.log('Account is deactivated for user:', user.username);
            return res.status(401).json({
                success: false,
                message: "Account is deactivated. Please contact support."
            });
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        
        if (!isMatch) {
            console.log('Invalid password for user:', user.username);
            return res.status(401).json({
                success: false,
                message: "Invalid username/email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username, 
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '7d' }
        );
        
        console.log('Login successful for user:', user.username);
        
        // Return user data and token (without password)
        const userData = user.toObject();
        delete userData.password;
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
    }
};
