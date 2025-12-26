const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '.env') });

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
    // For local development
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:2000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:2000",
    "http://127.0.0.1:5000"
];

// Middleware
app.use(express.json({ limit: '10mb' })); // Increase payload limit for images
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allows cookies and authentication headers if needed
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Load admin module
const adminModule = require('../admin');

// Connect to MongoDB
connectDB();

if (typeof adminModule.connectAdminDB === 'function') {
  adminModule.connectAdminDB();
}

// Load admin models
require('../admin/models/AdminDashboard');
require('../admin/models/AdminLog');
require('../admin/models/SystemSettings');

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/pets", require("./routes/petRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/books", require("./routes/bookRoutes"));

// Admin routes
app.use("/api/admin", adminModule.adminRoutes);
app.use("/api/admin/services", adminModule.serviceManagementRoutes);
app.use("/api/admin/notifications", adminModule.notificationRoutes);
app.use("/api/admin/pets", adminModule.petManagementRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running successfully!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Default route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PetService API Server",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      cart: "/api/cart",
      services: "/api/services",
      pets: "/api/pets",
      bookings: "/api/bookings",
      subscriptions: "/api/subscriptions",
      admin: "/api/admin",
      health: "/api/health"
    }
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Handle CORS errors
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation"
    });
  }

  // Handle MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      message: "Database error occurred"
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: "Token expired"
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Start server
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`🚀 PetService API Server running on port ${port}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
