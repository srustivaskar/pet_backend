const axios = require('axios');

async function testBookingAPI() {
  try {
    console.log('Testing booking creation...');
    
    // Test login first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'testuser',
      password: 'password123'
    });
    
    console.log('Login successful:', loginResponse.data.success);
    const token = loginResponse.data.token;
    
    // Get a service
    const servicesResponse = await axios.get('http://localhost:5000/api/services');
    const serviceId = servicesResponse.data.data[0]._id;
    console.log('Using service:', serviceId);
    
    // Test creating a pet
    const petResponse = await axios.post('http://localhost:5000/api/pets', {
      name: 'Test Pet',
      breed: 'Labrador',
      age: 3,
      species: 'dog'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Pet created:', petResponse.data.success);
    const petId = petResponse.data.data._id;
    
    // Test creating a booking
    const bookingResponse = await axios.post('http://localhost:5000/api/bookings', {
      serviceId: serviceId,
      petId: petId,
      bookingDate: new Date(Date.now() + 86400000).toISOString(),
      specialRequests: 'Test booking'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Booking created:', bookingResponse.data.success);
    console.log('Booking ID:', bookingResponse.data.data._id);
    
    // Check if booking is in database
    const mongoose = require('mongoose');
    const Booking = require('./models/Booking');
    await mongoose.connect(process.env.MONGO_URI);
    
    const bookingCount = await Booking.countDocuments();
    console.log('Total bookings in DB:', bookingCount);
    
  } catch (error) {
    console.error('API Test Error:', error.response?.data || error.message);
  }
}

testBookingAPI();
