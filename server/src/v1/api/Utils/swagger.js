import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import packageJson from "../../../../package.json" assert { type: "json" };

const { version } = packageJson;
const Base_Url = process.env.BASE_URL || "http://localhost:4000"; 

import log from "./logger.js";

// Swagger options
const options = {
  definition: {
    openapi: "3.0.0", 
    info: {
      title: "REST API DOCS",
      description: "API endpoints for Zoho mail services",
      contact: {
        name: "fincooper",
        email: "info@miniblog.com",
        url: "https://finexe.fincooper.in/",
      },
      version: version,
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local server"
      },
      {
        url: "<your live url here>", 
        description: "Live server"
      },
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
