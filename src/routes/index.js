const express = require('express');

// Our authentication middleware
const { authenticate } = require('../auth');

// version and author from package.json
const { version } = require('../../package.json');

// Create a router that we can use to mount our API
const router = express.Router();

const { createSuccessResponse } = require('../response'); // Use '../' to go up one level

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all with middleware so you have to be authenticated
 * in order to access things.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK. If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  const responseData = {
    status: 'ok',
    version,
    githubUrl: 'https://github.com/shara111/fragments',
    author: 'Sukhman Hara',
  };

  res.status(200).json(createSuccessResponse(responseData));
});

module.exports = router;
