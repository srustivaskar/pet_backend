const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Simple CORS setup
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

// Simple test route
app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Server is working!",
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Health check passed",
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`✅ Test server running on port ${port}`);
  console.log(`🔗 Test endpoint: http://localhost:${port}/test`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
});
