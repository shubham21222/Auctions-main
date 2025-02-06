import express, { static as expressStatic, urlencoded, json } from 'express';
import cors from "cors";
import{notFoundMiddleware} from "./src/v1/api/middlewares/notfoundmiddleware.js"
import Routerlocation from "./src/v1/api/index.js";
import { badRequest } from './src/v1/api/formatters/globalResponse.js'
// import userRoutes from "./src/v1/api/routes/user.routes.js"; // Ensure `.js` extension is added
import compression from 'compression';

const app = express();
import morgan from 'morgan';

app.use(express.json());
app.use(cors());
app.options('*', cors());

//image path
app.use('/static', expressStatic('static'))

app.use(urlencoded({ extended: false }));
app.use(json());
app.use(compression())


// Root Route - Check if API is running
app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "API is running!" });
  });


  


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
