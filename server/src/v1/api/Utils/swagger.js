import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = require(join(__dirname, '../../../../package.json'));

const { version } = packageJson;
const Base_Url = process.env.BASE_URL || "http://localhost:4000"; 

import log from "./logger.js";

// Swagger options
const options = {
  definition: {
    openapi: "3.0.0", 
    info: {
      title: "Auction System API Documentation",
      description: "API documentation for the Auction System",
      contact: {
        name: "Auction System",
        email: "info@auctionsystem.com",
        url: Base_Url,
      },
      version: version,
    },
    servers: [
      {
        url: Base_Url,
        description: "Local server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/v1/api/routes/*.js"], 
};

// Generate Swagger docs
const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  log.info(`Docs available at ${Base_Url}/docs`); 
}

export default swaggerDocs;
