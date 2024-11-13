const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragments');
require('dotenv').config();
const API_URL = process.env.API_URL || 'http://localhost:8080';

module.exports = async (req, res) => {
  try {
    const contentType = req.headers['content-type'];

    // Validate content type
    if (!['text/plain', 'application/json'].includes(contentType)) {
      logger.debug('Unsupported Content-Type:', contentType);
      return res.status(415).json(createErrorResponse(415, 'Unsupported media type'));
    }

    // Proceed if valid content type
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
      size: Buffer.byteLength(req.body),
    });
    await fragment.save();
    await fragment.setData(req.body);

    res.setHeader('Location', `${API_URL}/v1/fragments/${fragment.id}`);
    const successResponse = createSuccessResponse(fragment);
    res.status(201).json(successResponse);
  } catch (err) {
    logger.error('Error creating fragment:', err.message); // Log the error
    res.status(500).json(createErrorResponse(500, 'Error while creating fragment'));
  }
};