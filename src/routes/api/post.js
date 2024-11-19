const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragments');
require('dotenv').config();
const API_URL = process.env.API_URL || 'http://localhost:8080';

module.exports = async (req, res) => {
  try {
    const contentType = req.headers['content-type'];
    // Extract the main Content-Type (ignore parameters like charset)
    const [type] = contentType.split(';');

    // Validate Content-Type
    if (!['text/plain', 'application/json'].includes(type.trim())) {
      logger.debug('Unsupported Content-Type:', contentType);
      return res.status(415).json(createErrorResponse(415, 'Unsupported media type'));
    }

    // Debugging: Log the request body
    logger.debug('Request body:', req.body);

    // Ensure the body is a string for size calculation
    const body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body.toString();

    // Create and save the fragment
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
      size: Buffer.byteLength(body),
    });
    await fragment.save();
    await fragment.setData(body);

    // Set the Location header
    res.setHeader('Location', `${API_URL}/v1/fragments/${fragment.id}`);
    const successResponse = createSuccessResponse(fragment);
    res.status(201).json(successResponse);
  } catch (err) {
    logger.error('Error creating fragment:', err.message, err.stack); // Log full error details
    res.status(500).json(createErrorResponse(500, 'Error while creating fragment'));
  }
};
