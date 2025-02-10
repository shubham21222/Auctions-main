import express, { static as expressStatic, urlencoded, json } from 'express';
import cors from "cors";
import{notFoundMiddleware} from "./src/v1/api/middlewares/notfoundmiddleware.js"
import Routerlocation from "./src/v1/api/index.js";
import { badRequest } from './src/v1/api/formatters/globalResponse.js'
// import userRoutes from "./src/v1/api/routes/user.routes.js"; // Ensure `.js` extension is added
import compression from 'compression';

import path from "path";
import { fileURLToPath } from "url";

// Get the equivalent of `__dirname` in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




const app = express();
import morgan from 'morgan';
// Serve static files
app.use(express.static(__dirname));
app.use("/uploads/", express.static("uploads"));
app.use("/uploads/pdf", express.static("uploads/pdf"));

app.use(express.json());
app.use(cors());
app.options('*', cors());



app.use(urlencoded({ extended: false }));
app.use(json());
app.use(compression())


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
