const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendAdminBookingNotification = async (bookingData) => {
    try {
        console.log('📧 Email service: Starting email send process...');
        
        const transporter = createTransporter();
        
        console.log('📧 Email service: Transporter created');
        
        const { booking, customer, pet, service } = bookingData;
        
        console.log('📧 Email service: Preparing email for admin...');

        // Format booking date and time
        const bookingDate = new Date(booking.bookingDate);
        const formattedDate = bookingDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = bookingDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const endTime = new Date(bookingDate.getTime() + (service.duration * 60000));
        const formattedEndTime = endTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        const mailOptions = {
            from: `"PetCare Service" <${process.env.EMAIL_USER}>`,
            to: 'sandhyavaskar1@gmail.com',
            subject: `🔔 New Booking: ${service.name} - ${customer.name}'s ${pet.name}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
                    <!-- Header -->
                    <div style="background-color: #4CAF50; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0;">🐾 New Booking Confirmation</h1>
                    </div>
                    
                    <!-- Service Card -->
                    <div style="background-color: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; border-left: 5px solid #4CAF50;">
                        <h2 style="color: #2c3e50; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                            ${service.name} Service
                        </h2>
                        
                        <div style="display: flex; margin-bottom: 20px; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 200px; margin-right: 20px; margin-bottom: 15px;">
                                <h3 style="color: #4CAF50; margin-top: 0;">📅 When</h3>
                                <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
                                <p style="margin: 5px 0;"><strong>Time:</strong> ${formattedTime} - ${formattedEndTime}</p>
                                <p style="margin: 5px 0;"><strong>Duration:</strong> ${service.duration} minutes</p>
                            </div>
                            <div style="flex: 1; min-width: 200px; margin-bottom: 15px;">
                                <h3 style="color: #4CAF50; margin-top: 0;">💰 Price</h3>
                                <p style="margin: 5px 0; font-size: 1.2em;">
                                    <strong>Total:</strong> $${booking.totalPrice.toFixed(2)}
                                </p>
                                <p style="margin: 5px 0;"><strong>Status:</strong> 
                                    <span style="color: ${booking.status === 'confirmed' ? '#4CAF50' : '#ff9800'}; font-weight: bold;">
                                        ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </p>
                            </div>
                        </div>
                        
                        <div style="margin: 20px 0; padding: 15px; background-color: #e8f5e9; border-radius: 5px;">
                            <h3 style="color: #2e7d32; margin-top: 0;">📝 Service Details</h3>
                            <p style="margin: 5px 0;">${service.description || 'No additional details provided.'}</p>
                            ${service.additionalNotes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${service.additionalNotes}</p>` : ''}
                        </div>
                    </div>
                    
                    <!-- Customer & Pet Info -->
                    <div style="display: flex; margin: 20px 0; flex-wrap: wrap;">
                        <!-- Customer Info -->
                        <div style="flex: 1; min-width: 250px; background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-right: 10px; margin-bottom: 15px;">
                            <h3 style="color: #1976D2; margin-top: 0; border-bottom: 1px solid #bbdefb; padding-bottom: 8px;">
                                👤 Customer Information
                            </h3>
                            <p style="margin: 8px 0;"><strong>Name:</strong> ${customer.name}</p>
                            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${customer.email}" style="color: #1976D2; text-decoration: none;">${customer.email}</a></p>
                            <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${customer.phone}" style="color: #1976D2; text-decoration: none;">${customer.phone}</a></p>
                            ${customer.address ? `<p style="margin: 8px 0;"><strong>Address:</strong> ${customer.address}</p>` : ''}
                        </div>
                        
                        <!-- Pet Info -->
                        <div style="flex: 1; min-width: 250px; background-color: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <h3 style="color: #F57C00; margin-top: 0; border-bottom: 1px solid #ffe0b2; padding-bottom: 8px;">
                                🐾 Pet Information
                            </h3>
                            <p style="margin: 8px 0;"><strong>Name:</strong> ${pet.name}</p>
                            <p style="margin: 8px 0;"><strong>Type:</strong> ${pet.species}</p>
                            <p style="margin: 8px 0;"><strong>Breed:</strong> ${pet.breed || 'Not specified'}</p>
                            <p style="margin: 8px 0;"><strong>Age:</strong> ${pet.age || 'Not specified'}</p>
                            ${pet.notes ? `<p style="margin: 8px 0;"><strong>Notes:</strong> ${pet.notes}</p>` : ''}
                        </div>
                    </div>
                    
                    <!-- Special Requests & Notes -->
                    ${(booking.specialRequests || booking.notes) ? `
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #5d4037; margin-top: 0; border-bottom: 1px solid #d7ccc8; padding-bottom: 8px;">
                            📋 Additional Information
                        </h3>
                        ${booking.specialRequests ? `
                        <div style="margin-bottom: 15px;">
                            <h4 style="margin: 10px 0 5px 0; color: #5d4037;">Special Requests:</h4>
                            <p style="margin: 5px 0; padding: 10px; background: white; border-radius: 4px;">
                                ${booking.specialRequests}
                            </p>
                        </div>
                        ` : ''}
                        ${booking.notes ? `
                        <div>
                            <h4 style="margin: 10px 0 5px 0; color: #5d4037;">Additional Notes:</h4>
                            <p style="margin: 5px 0; padding: 10px; background: white; border-radius: 4px;">
                                ${booking.notes}
                            </p>
                        </div>
                        ` : ''}
                    </div>
                    ` : ''}
                    
                    <!-- Action Buttons -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://your-petcare-app.com'}/dashboard/bookings/${booking._id}" 
                           style="display: inline-block; background-color: #4CAF50; color: white; 
                                  padding: 12px 25px; text-decoration: none; border-radius: 4px; 
                                  font-weight: bold; margin: 0 10px;">
                            View Booking
                        </a>
                        <a href="tel:${process.env.CONTACT_PHONE || '+1234567890'}" 
                           style="display: inline-block; background-color: #2196F3; color: white; 
                                  padding: 12px 25px; text-decoration: none; border-radius: 4px; 
                                  font-weight: bold; margin: 0 10px;">
                            Call Us
                        </a>
                    </div>
                    
                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>For any questions, please contact us at 
                            <a href="mailto:${process.env.CONTACT_EMAIL || 'support@petcare.com'}" 
                               style="color: #4CAF50; text-decoration: none;">
                                ${process.env.CONTACT_EMAIL || 'support@petcare.com'}
                            </a>
                        </p>
                        <p>© ${new Date().getFullYear()} PetCare Service. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        console.log('📧 Email service: Sending email...');
        await transporter.sendMail(mailOptions);
        console.log('✅ Email service: Email sent successfully to sandhyavaskar1@gmail.com');
        return true;
    } catch (error) {
        console.error('❌ Email service: Error sending email:', error);
        return false;
    }
};

const sendOwnerBookingConfirmation = async (bookingData) => {
    try {
        console.log('📧 Email service: Sending booking confirmation to pet owner...');
        
        const transporter = createTransporter();
        const { booking, customer, pet, service } = bookingData;

        // Format booking date and time
        const bookingDate = new Date(booking.bookingDate);
        const formattedDate = bookingDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = bookingDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const endTime = new Date(bookingDate.getTime() + (service.duration * 60000));
        const formattedEndTime = endTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        const mailOptions = {
            from: `"PetCare Service" <${process.env.EMAIL_USER}>`,
            to: customer.email, // Send to the actual customer email
            subject: `✅ Booking Confirmed: ${service.name} for ${pet.name}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
                    <!-- Header -->
                    <div style="background-color: #4CAF50; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0;">🐾 Booking Confirmed!</h1>
                        <p style="color: white; margin: 10px 0 0 0; font-size: 1.1em;">We're excited to take care of ${pet.name}!</p>
                    </div>
                    
                    <!-- Service Card -->
                    <div style="background-color: #f8f9fa; padding: 25px; border-radius: 0 0 8px 8px; border-left: 5px solid #4CAF50;">
                        <h2 style="color: #2c3e50; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                            ${service.name} Service
                        </h2>
                        
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #4CAF50; margin-top: 0;">📅 Appointment Details</h3>
                            <p style="margin: 8px 0;"><strong>Date:</strong> ${formattedDate}</p>
                            <p style="margin: 8px 0;"><strong>Time:</strong> ${formattedTime} - ${formattedEndTime}</p>
                            <p style="margin: 8px 0;"><strong>Duration:</strong> ${service.duration} minutes</p>
                            <p style="margin: 8px 0;"><strong>Total Amount:</strong> $${booking.totalPrice.toFixed(2)}</p>
                            <p style="margin: 8px 0;"><strong>Status:</strong> 
                                <span style="color: #4CAF50; font-weight: bold;">
                                    Confirmed
                                </span>
                            </p>
                        </div>
                        
                        <div style="margin: 20px 0; padding: 15px; background-color: #e8f5e9; border-radius: 5px;">
                            <h3 style="color: #2e7d32; margin-top: 0;">📝 Service Details</h3>
                            <p style="margin: 5px 0;">${service.description || 'No additional details provided.'}</p>
                        </div>
                    </div>
                    
                    <!-- Pet Info -->
                    <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1976D2; margin-top: 0; border-bottom: 1px solid #bbdefb; padding-bottom: 8px;">
                            🐾 Pet Information
                        </h3>
                        <p style="margin: 8px 0;"><strong>Name:</strong> ${pet.name}</p>
                        <p style="margin: 8px 0;"><strong>Type:</strong> ${pet.species}</p>
                        <p style="margin: 8px 0;"><strong>Breed:</strong> ${pet.breed || 'Not specified'}</p>
                        ${pet.notes ? `<p style="margin: 8px 0;"><strong>Notes:</strong> ${pet.notes}</p>` : ''}
                    </div>
                    
                    ${booking.specialRequests ? `
                    <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #F57C00; margin-top: 0; border-bottom: 1px solid #ffe0b2; padding-bottom: 8px;">
                            📋 Your Special Requests
                        </h3>
                        <p style="margin: 5px 0; padding: 10px; background: white; border-radius: 4px;">
                            ${booking.specialRequests}
                        </p>
                    </div>
                    ` : ''}
                    
                    <!-- Next Steps -->
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #5d4037;">Next Steps</h3>
                        <ol style="padding-left: 20px;">
                            <li style="margin-bottom: 10px;">
                                <strong>Prepare your pet:</strong> Make sure ${pet.name} is ready at the scheduled time.
                            </li>
                            <li style="margin-bottom: 10px;">
                                <strong>Contact us:</strong> Need to make changes? Reply to this email or call us.
                            </li>
                            <li>
                                <strong>Review your booking:</strong> You can view or modify your booking details through your account.
                            </li>
                        </ol>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://your-petcare-app.com'}/my-bookings" 
                           style="display: inline-block; background-color: #4CAF50; color: white; 
                                  padding: 12px 25px; text-decoration: none; border-radius: 4px; 
                                  font-weight: bold; margin: 0 10px;">
                            View My Bookings
                        </a>
                    </div>
                    
                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px;">
                        <p>Thank you for choosing PetCare Service!</p>
                        <p>For any questions, please contact us at 
                            <a href="mailto:${process.env.CONTACT_EMAIL || 'support@petcare.com'}" 
                               style="color: #4CAF50; text-decoration: none;">
                                ${process.env.CONTACT_EMAIL || 'support@petcare.com'}
                            </a>
                        </p>
                        <p>© ${new Date().getFullYear()} PetCare Service. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        console.log(`📧 Email service: Sending confirmation to ${customer.email}...`);
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email service: Confirmation sent to ${customer.email}`);
        return true;
    } catch (error) {
        console.error('❌ Email service: Error sending confirmation email:', error);
        return false;
    }
};

// Function to send both admin notification and owner confirmation
const sendBookingEmails = async (bookingData) => {
    try {
        // Send to admin
        await sendAdminBookingNotification(bookingData);
        
        // Send to pet owner
        await sendOwnerBookingConfirmation(bookingData);
        
        return true;
    } catch (error) {
        console.error('❌ Email service: Error in sendBookingEmails:', error);
        return false;
    }
};

module.exports = {
    sendAdminBookingNotification,
    sendOwnerBookingConfirmation,
    sendBookingEmails
};
