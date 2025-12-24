import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./src/v1/api/config/db.js"
import swaggerDocs from './src/v1/api/Utils/swagger.js'
import { initCron } from "./src/v1/api/Utils/node-cron.js"
import { initializeSocket } from  "./src/v1/api/config/socketConfig.js"

dotenv.config();

const PORT = process.env.PORT || 4000;
swaggerDocs(app, PORT);
const server = http.createServer(app);

// Initialize WebSocket and make it available to the app
const io = initializeSocket(server);
app.set('io', io);

// Connect to MongoDB
connectDB().then(() => {
    initCron();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});