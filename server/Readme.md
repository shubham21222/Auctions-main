# Shopping Website Backend

## Overview
This is the backend for a shopping website, built using **Node.js** and **Express.js**, with **MongoDB** as the database. It provides APIs for user authentication, product management, and order processing.

## Features
- User authentication with **JWT**
- Secure password hashing using **bcrypt**
- Product and category management
- Shopping cart functionality
- Order processing
- Rate limiting for security
- API documentation using **Swagger**

## Tech Stack
- **Node.js** & **Express.js** - Backend framework
- **MongoDB** & **Mongoose** - Database & ORM
- **JWT** & **Passport.js** - Authentication
- **Nodemailer** - Email notifications
- **Swagger** - API Documentation
- **Pino** - Logging

## Installation

### Prerequisites
Ensure you have **Node.js** and **MongoDB** installed.

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/shopping-website-backend.git
   cd shopping-website-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```sh
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add a new product (Admin only)

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order details

## Development
- **Run in development mode:** `npm run dev`
- **Run in production mode:** `npm start`

## License
This project is licensed under the MIT License.

