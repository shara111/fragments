// src/auth/basic-auth.js

// Configure HTTP Basic Auth strategy for Passport, see:
// https://github.com/http-auth/http-auth-passport

const auth = require('http-auth');
const authPassport = require('http-auth-passport');

const authorize = require('./auth-middleware');

// Check if Basic Auth should be enabled
const enableBasicAuth = !!process.env.HTPASSWD_FILE;

if (!enableBasicAuth) {
  console.log('HTPASSWD_FILE not set. Basic Auth will not be enabled.');
}

module.exports.strategy = () => {
  if (!enableBasicAuth) {
    throw new Error('Basic Auth is not enabled. Check your configuration.');
  }
  // For our Passport authentication strategy, we'll look for a
  // username/password pair in the Authorization header.
  return authPassport(
    auth.basic({
      file: process.env.HTPASSWD_FILE,
    })
  );
};

// Use Cognito or Basic Auth based on the environment
module.exports.authenticate = () => {
  if (enableBasicAuth) {
    return authorize('http'); // Delegate authorization to the middleware
  }
  throw new Error('Authentication not set up correctly.');
};
