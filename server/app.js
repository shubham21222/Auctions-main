import express, { static as expressStatic, urlencoded, json } from 'express';
import cors from "cors";
import { notFoundMiddleware } from "./src/v1/api/middlewares/notfoundmiddleware.js";
import Routerlocation from "./src/v1/api/index.js";
import { badRequest } from './src/v1/api/formatters/globalResponse.js';
import compression from 'compression';
import { stripeWebhook } from "./src/v1/api/controllers/AuctionController/auction.controller.js";
import path from "path";
import { Orderwebhook } from "./src/v1/api/controllers/OrderController/order.controller.js";

const app = express();
import morgan from 'morgan';

// Serve static files

// Stripe Webhook Route (MUST be before express.json())
// app.post("/v1/api/auction/stripe-webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Stripe webhook for order create
app.post("/v1/api/auction/order-webhook", express.raw({ type: "application/json" }), Orderwebhook);

// Prevent express.json() from affecting webhooks
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/v1/api/auction/stripe-webhook") || req.originalUrl.startsWith("/v1/api/auction/order-webhook")) {
    return next(); // Skip express.json() for webhooks
  }
  // Increase JSON payload limit to 10MB
  express.json({ limit: '10mb' })(req, res, next);
});

app.use(cors());
app.options('*', cors());

// Increase URL-encoded payload limit to 10MB
app.use(urlencoded({ extended: false, limit: '10mb' }));
app.use(compression());

// Serve uploaded files statically
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

// Root Route - Check if API is running
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running!" });
});

// Add API ROUTES HERE
app.use("/v1/api", Routerlocation);

// Not Found Middleware (Handles Undefined Routes)
// app.use(notFoundMiddleware);

// Error Handling Middleware with specific handling for payload too large
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload too large. Maximum allowed size is 10MB.',
    });
  }
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

export default app;