const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
const emailConfig = require('../config/emailConfig');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: emailConfig.service,
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth,
});

// Configure Handlebars for email templates
transporter.use('compile', hbs({
  viewEngine: {
    extName: '.hbs',
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, '../email-templates'),
  extName: '.hbs',
}));

/**
 * Send a welcome email to a new user
 * @param {Object} user - User object containing name and email
 * @param {string} user.name - User's name
 * @param {string} user.email - User's email address
 */
const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: emailConfig.from,
      to: user.email,
      subject: emailConfig.subjects.welcome,
      template: 'welcome',
      context: {
        name: user.name,
        email: user.email,
        currentYear: new Date().getFullYear(),
      },
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Send order confirmation email
 * @param {Object} order - Order details
 * @param {Object} user - User details
 */
const sendOrderConfirmation = async (order, user) => {
  try {
    const mailOptions = {
      from: emailConfig.from,
      to: user.email,
      subject: emailConfig.subjects.orderConfirmation,
      template: 'order-confirmation',
      context: {
        name: user.name,
        orderId: order._id,
        orderDate: new Date(order.createdAt).toLocaleDateString(),
        items: order.items.map(item => ({
          title: item.book.title,
          quantity: item.quantity,
          price: item.price,
          total: (item.quantity * item.price).toFixed(2),
        })),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        shippingAddress: order.shippingAddress,
        currentYear: new Date().getFullYear(),
      },
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {Object} user - User details
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: emailConfig.from,
      to: user.email,
      subject: emailConfig.subjects.passwordReset,
      template: 'password-reset',
      context: {
        name: user.name,
        resetUrl,
        currentYear: new Date().getFullYear(),
      },
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send order shipped notification
 * @param {Object} order - Order details
 * @param {Object} user - User details
 * @param {string} trackingNumber - Shipping tracking number
 */
const sendOrderShippedEmail = async (order, user, trackingNumber) => {
  try {
    const mailOptions = {
      from: emailConfig.from,
      to: user.email,
      subject: emailConfig.subjects.orderShipped,
      template: 'order-shipped',
      context: {
        name: user.name,
        orderId: order._id,
        trackingNumber,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        currentYear: new Date().getFullYear(),
      },
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order shipped email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending order shipped email:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendPasswordResetEmail,
  sendOrderShippedEmail,
  transporter, // Export transporter for custom emails
};
