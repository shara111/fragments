const passport = require('passport');
const { createErrorResponse } = require('../response');
const hash = require('../hash');
const logger = require('../logger');
const BearerStrategy = require('passport-http-bearer').Strategy;


/**
 * @param {'bearer' | 'http'} strategyName - the passport strategy to use
 * @returns {Function} - the middleware function to use for authentication
 */
module.exports = (strategyName) => {
  return function (req, res, next) {
    /**
     * Define a custom callback to run after the user has been authenticated
     * where we can modify the way that errors are handled, and hash emails.
     * @param {Error} err - an error object
     * @param {string} email - an authenticated user's email address
     */
    function callback(err, email) {
      // Something failed, let the the error handling middleware deal with it
      if (err) {
        logger.warn({ err }, 'error authenticating user');
        return next(createErrorResponse(500, 'Unable to authenticate user'));
      }

      // Not authorized, return a 401
      if (!email) {
        return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
      }

      // Authorized. Hash the user's email, attach to the request, and continue
      req.user = hash(email);
      logger.debug({ email, hash: req.user }, 'Authenticated user');

      // Call the next function in the middleware chain (e.g. your route handler)
      next();
    }

    // Call the given passport strategy's authenticate() method, passing the
    // req, res, next objects.  Invoke our custom callback when done.
    passport.authenticate(strategyName, { session: false }, callback)(req, res, next);
  };
};