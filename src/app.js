const pinoHttp = require('pino-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const logger = require('./logger'); // Pino logger setup
const authenticate = require('./auth/basic-auth');  // Import authenticate correctly
const { createErrorResponse } = require('./response');

// Create an express app instance
const app = express();

// Logging middleware
app.use(pinoHttp({ logger }));

// Security, CORS, and compression middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// JSON body parser
app.use(express.json());  // This parses incoming JSON requests, ensuring req.body is available

// Passport authentication setup
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Define routes
app.use('/', require('./routes'));

// Default 404 error handler for unmatched routes
app.use((req, res) => {
  res.status(404).json(createErrorResponse('Resource not found', 404));
});

// Global error handler
app.use((err, req, res) => {  // Added 'next' parameter for proper error handling
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  logger.error({ err, statusCode }, 'Global error handler caught an error'); // Log the error
  res.status(statusCode).json(createErrorResponse(message, statusCode));
});

module.exports = app;
