// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport'); // Import Passport

const logger = require('./logger');

const { createErrorResponse } = require('./response'); // Import the function


const pino = require('pino-http')({
  logger,
});

// Import the authentication strategy from auth.js
const authenticate = require('./auth');

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Set up our passport authentication middleware
passport.use(authenticate.strategy()); // Use the new strategy defined in auth.js
app.use(passport.initialize());        // Initialize Passport

// Define our routes
app.use('/', require('./routes'));      // Define all routes (including protected routes)



// Default 404 Error Handler
app.use((req, res) => {
  res.status(404).json(createErrorResponse('Resource not found', 404));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json(createErrorResponse(message, statusCode));
});

// Export our `app` so we can access it in server.js
module.exports = app;
