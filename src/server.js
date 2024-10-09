require('dotenv').config({ path: 'env.jest' });
// src/server.js
// We want to gracefully shutdown our server
const stoppable = require('stoppable');

// Get our logger instance
const logger = require('./logger');

// Get our express app instance
const app = require('./app');

// Get the desired port from the process' environment. Default to `8080`
const port = parseInt(process.env.PORT || '8080', 10);

//if the log level is "debug" print all environment variables
if (process.env.LOG_LEVEL === 'debug') {
  console.log('Environment Variables: ', process.env);
}

// Start a server listening on this port
const server = stoppable(
  app.listen(port, (err) => {
    if (err) {
      logger.error(`Error starting server: ${err}`);
      process.exit(1);
    }
    console.log(`Server started on port ${port}`);
    logger.info(`Server started on port ${port}`);
  })
);
// Export our server instance so other parts of our code can access it if necessary.
module.exports = server;
