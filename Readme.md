# Auction Platform

A modern, full-stack auction platform built with Next.js, Node.js, and Stripe integration for secure payments.

## 🌟 Features

### For Users
- Real-time auction bidding
- Secure payment processing with Stripe
- User authentication and authorization
- Profile management
- Billing address management
- Order history tracking
- Responsive design for all devices

### For Sellers
- Easy product listing
- Real-time bid tracking
- Secure payment handling
- Order management
- Product management dashboard

## 🛠️ Tech Stack

### Frontend (Client)
- Next.js 13+ with App Router
- React Redux for state management
- Tailwind CSS for styling
- Stripe Elements for payment processing
- React Hot Toast for notifications
- i18n-iso-countries for country selection

### Backend (Server)
- Node.js
- Express.js
- MongoDB for database
- JWT for authentication
- Stripe API integration
- RESTful API architecture

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Stripe account
- npm or yarn package manager

### Environment Variables

#### Client (.env.local)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_API_URL=your_api_url
```

#### Server (.env)
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=5000
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/auction-platform.git
cd auction-platform
```

2. Install client dependencies
```bash
cd client
npm install
```

3. Install server dependencies
```bash
cd ../server
npm install
```

4. Start the development servers

For client:
```bash
cd client
npm run dev
```

For server:
```bash
cd server
npm run dev
```

The application will be available at:
- Client: http://localhost:3000
- Server: http://localhost:5000

## 📁 Project Structure

```
auction-platform/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   │   ├── components/    # Reusable components
│   │   │   ├── redux/         # Redux store and slices
│   │   │   └── styles/        # Global styles
│   │   └── public/            # Static assets
│   └── server/                # Backend application
│       ├── src/
│       │   ├── controllers/   # Route controllers
│       │   ├── models/        # Database models
│       │   ├── routes/        # API routes
│       │   ├── middleware/    # Custom middleware
│       │   └── utils/         # Utility functions
│       └── config/            # Configuration files
```

## 🔒 Security Features

- JWT-based authentication
- Secure password hashing
- Protected API routes
- Input validation and sanitization
- XSS protection
- CORS configuration
- Rate limiting
- Secure payment processing with Stripe

## 💳 Payment Integration

The platform uses Stripe for secure payment processing:
- Card payment support
- Secure checkout flow
- Payment intent handling
- Webhook integration
- Error handling and validation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Stripe for payment processing
- Next.js team for the amazing framework
- MongoDB for the database
- All contributors and supporters

## 📞 Support

For support, email support@yourdomain.com or create an issue in the repository.

---

Made with ❤️ by [Your Name/Company]