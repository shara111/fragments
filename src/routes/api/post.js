const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragments');
const contentType = require('content-type');
require('dotenv').config();

module.exports = async (req, res) => {
  try {
    // Parse the content type from the request headers
    const { type } = contentType.parse(req);
    const fragBody = req.body;

    // Ensure the content type is supported
    if (Fragment.isSupportedType(type)) {
      // Check if the body is a valid Buffer (for binary data like images)
      if (Buffer.isBuffer(fragBody) || typeof fragBody === 'string') {
        process.env.API_URL = 'http://' + req.headers.host;

        // Create a new fragment with ownerId (hashed email), content type, and the body
        const fragment = new Fragment({
          ownerId: req.user, // The authenticated user's hashed email
          type: type,
          content: fragBody,  // Make sure you're saving the content/body of the fragment
        });

        // Save the new fragment to the database
        await fragment.save();

        // Set the Location header to where the new fragment can be accessed
        res.location(`${process.env.API_URL}/v1/fragments/${fragment.id}`);

        // Respond with 201 status and the fragment metadata
        res.status(201).json(createSuccessResponse({ fragment }));
      } else {
        // Invalid request body format
        res.status(400).json(createErrorResponse(400, 'Invalid request body'));
      }
    } else {
      // Unsupported content type
      res.status(415).json(createErrorResponse(415, 'Unsupported content type'));
    }
  } catch (err) {
    // Catch any other errors and respond with a 500 status
    logger.error({ err }, 'Error creating fragment');
    res.status(500).json(createErrorResponse(500, `Internal server error: ${err.message}`));
  }
};


