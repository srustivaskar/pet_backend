# PetService Backend API

A comprehensive backend API for the PetService application, providing authentication, pet management, service booking, and subscription management.

## 🚀 Features

- **User Authentication**: JWT-based authentication with signup and login
- **Pet Management**: Complete pet profile management with medical records
- **Service Management**: Pet care services with categories and pricing
- **Booking System**: Service booking with availability checking
- **Subscription Management**: Multiple subscription plans with usage tracking
- **Shopping Cart**: Cart functionality for services
- **Comprehensive Error Handling**: Global error handling and validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/petservice
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or update the MONGO_URI for your MongoDB Atlas connection.

5. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
```
**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Service Endpoints

#### Get All Services
```http
GET /api/services?category=grooming&minPrice=20&maxPrice=100&page=1&limit=10
```

#### Get Service by ID
```http
GET /api/services/:id
```

#### Get Services by Category
```http
GET /api/services/category/:category
```

#### Create Service (Admin)
```http
POST /api/services
Authorization: Bearer <token>
```

### Pet Endpoints

#### Get User Pets
```http
GET /api/pets
Authorization: Bearer <token>
```

#### Get Pet by ID
```http
GET /api/pets/:id
Authorization: Bearer <token>
```

#### Create Pet
```http
POST /api/pets
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "name": "Buddy",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 25.5,
  "gender": "male",
  "species": "dog",
  "color": "Golden",
  "specialInstructions": "Has separation anxiety"
}
```

#### Add Medical Record
```http
POST /api/pets/:id/medical
Authorization: Bearer <token>
```

#### Add Vaccination Record
```http
POST /api/pets/:id/vaccination
Authorization: Bearer <token>
```

### Booking Endpoints

#### Get User Bookings
```http
GET /api/bookings?status=confirmed&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Booking by ID
```http
GET /api/bookings/:id
Authorization: Bearer <token>
```

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "serviceId": "service_id",
  "petId": "pet_id",
  "bookingDate": "2024-01-15T10:00:00Z",
  "specialRequests": "Please be gentle with my pet"
}
```

#### Cancel Booking
```http
POST /api/bookings/:id/cancel
Authorization: Bearer <token>
```

#### Get Available Slots
```http
GET /api/bookings/availability/slots?serviceId=service_id&date=2024-01-15
Authorization: Bearer <token>
```

### Subscription Endpoints

#### Get User Subscription
```http
GET /api/subscriptions
Authorization: Bearer <token>
```

#### Get Subscription Plans
```http
GET /api/subscriptions/plans/all
```

#### Create Subscription
```http
POST /api/subscriptions
Authorization: Bearer <token>
```

#### Cancel Subscription
```http
POST /api/subscriptions/:id/cancel
Authorization: Bearer <token>
```

### Cart Endpoints

#### Add to Cart
```http
POST /api/cart/add
Authorization: Bearer <token>
```

#### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Update Cart Item
```http
PUT /api/cart/update
Authorization: Bearer <token>
```

#### Remove from Cart
```http
POST /api/cart/remove
Authorization: Bearer <token>
```

#### Clear Cart
```http
DELETE /api/cart/clear
Authorization: Bearer <token>
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // if applicable
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // if validation errors
}
```

## 🗄️ Database Models

### User
- username (unique)
- email (unique)
- password (hashed)
- role (user/admin)
- isActive

### Service
- name (unique)
- description
- price
- duration
- category
- features
- requirements
- isActive

### Pet
- name
- ownerId (User reference)
- breed
- age
- weight
- gender
- species
- medicalHistory
- vaccinations
- allergies
- medications
- specialInstructions

### Booking
- customerId (User reference)
- serviceId (Service reference)
- petId (Pet reference)
- bookingDate
- duration
- totalPrice
- status
- paymentStatus

### Subscription
- customerId (User reference)
- planType
- planName
- price
- billingCycle
- features
- status
- usageStats

### Cart
- userId (User reference)
- items (product references)
- totalItems
- totalPrice

## 🧪 Testing the API

You can test the API using tools like:
- **Postman**: Import the API endpoints
- **curl**: Use command line
- **Thunder Client**: VS Code extension

### Example curl command:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🚀 Deployment

1. **Environment Setup**: Configure production environment variables
2. **Database**: Use MongoDB Atlas for production
3. **Security**: Use HTTPS and secure JWT secrets
4. **Monitoring**: Add logging and monitoring tools

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please contact the development team or create an issue in the repository.
