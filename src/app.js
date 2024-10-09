const pinoHttp = require('pino-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const logger = require('./logger'); // Your pino logger
const authenticate = require('./auth/basic-auth');  // Import authenticate correctly
const { createErrorResponse } = require('./response');

// Create an express app instance
const app = express();
// Middleware
app.use(pinoHttp({ logger }));
// Use other middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Passport authentication setup
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Define routes
app.use('/', require('./routes'));

// Default 404 error handler
app.use((req, res) => {
  res.status(404).json(createErrorResponse('Resource not found', 404));
});

// Global error handler
app.use((err, req, res) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json(createErrorResponse(message, statusCode));
});

module.exports = app;