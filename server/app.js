import express, { static as expressStatic, urlencoded, json } from 'express';
import cors from "cors";
import{notFoundMiddleware} from "./src/v1/api/middlewares/notfoundmiddleware.js"
import Routerlocation from "./src/v1/api/index.js";
import { badRequest } from './src/v1/api/formatters/globalResponse.js'
// import userRoutes from "./src/v1/api/routes/user.routes.js"; // Ensure `.js` extension is added
import compression from 'compression';
import { stripeWebhook } from "./src/v1/api/controllers/AuctionController/auction.controller.js"
import path from "path";
import{Orderwebhook} from "./src/v1/api/controllers/OrderController/order.controller.js"




const app = express();
import morgan from 'morgan';
// Serve static files

// ✅ Stripe Webhook Route (MUST be before express.json())
app.post("/v1/api/auction/stripe-webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Stripe webhook for order create //

app.post("/v1/api/auction/order-webhook" , express.raw({ type: "application/json" }) , Orderwebhook)



app.use(express.json());
app.use(cors());
app.options('*', cors());



app.use(urlencoded({ extended: false }));
app.use(json());
app.use(compression())


// ✅ Fix: Serve files from absolute path
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));


// Root Route - Check if API is running
app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "API is running!" });
  });


  
// // Serve uploaded images statically
// app.use("/uploads", express.static("uploads"));

// Add API ROUTES HERE //
app.use("/v1/api", Routerlocation);



//----------for invalid requests start -----------------------


// app.all('*', async (req, res) => {
//     await badRequest(res, 'Invalid URI');
// });  
  



// Not Found Middleware (Handles Undefined Routes)
app.use(notFoundMiddleware);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

export default app;
