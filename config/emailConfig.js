require('dotenv').config();

module.exports = {
  // Email service configuration
  service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail', 'sendgrid', etc.
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
  
  // Default from email
  from: `"${process.env.EMAIL_FROM_NAME || 'BookStore'}" <${process.env.EMAIL_USERNAME}>`,
  
  // Email templates path
  templates: {
    dir: 'email-templates',
    defaultLayout: 'main',
    extname: '.hbs',
  },
  
  // Email subjects
  subjects: {
    welcome: 'Welcome to Our BookStore!',
    orderConfirmation: 'Your Order Confirmation',
    passwordReset: 'Password Reset Request',
    orderShipped: 'Your Order Has Shipped!',
    accountActivation: 'Activate Your Account',
  },
};

// Note: For Gmail, you might need to:
// 1. Enable "Less secure app access" or
// 2. Use an App Password if you have 2FA enabled or
// 3. Use OAuth2 authentication (recommended for production)
