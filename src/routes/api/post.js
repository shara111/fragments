const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragments');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:8080';

// Helper function to validate Content-Type
const isValidContentType = (type) => ['text/plain', 'application/json', 'text/markdown'].includes(type?.trim());

module.exports = async (req, res) => {
  try {
    const contentType = req.headers['content-type'];
    if (!contentType) {
      logger.debug('Missing Content-Type header');
      return res.status(400).json(createErrorResponse(400, 'Content-Type header is required'));
    }

    // Extract the main Content-Type (ignore parameters like charset)
    const [type] = contentType.split(';');

    logger.debug('Received Content-Type:', contentType);

    // Validate Content-Type
    if (!isValidContentType(type)) {
      logger.debug('Unsupported Content-Type:', contentType);
      return res.status(415).json(createErrorResponse(415, 'Unsupported media type'));
    }

    if (!req.user) {
      logger.error('Unauthorized access: req.user is missing');
      return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
    }
    logger.debug('Authenticated user:', req.user);

    const body = req.body ? (typeof req.body === 'object' ? JSON.stringify(req.body) : req.body.toString()) : null;
    if (!body) {
      logger.debug('Request body is empty or invalid');
      return res.status(400).json(createErrorResponse(400, 'Request body is required'));
    }

    logger.debug('Request body:', body);

    // Temporary bypass for text/markdown fragments
    if (type.trim() === 'text/markdown') {
      logger.warn('Skipping processing for text/markdown temporarily');
      const fragment = new Fragment({
        ownerId: req.user,
        type: type.trim(),
        size: Buffer.byteLength(body),
      });

      const location = `${API_URL}/v1/fragments/${fragment.id}`;
      res.setHeader('Location', location);

      return res.status(201).json(createSuccessResponse(fragment));
    }

    const fragment = new Fragment({
      ownerId: req.user,
      type: type.trim(),
      size: Buffer.byteLength(body),
    });

    try {
      await fragment.save();
      logger.debug('Fragment metadata saved to DynamoDB:', fragment);
      await fragment.setData(body);
      logger.debug('Fragment data saved to DynamoDB');
    } catch (err) {
      logger.error('Error saving fragment to DynamoDB:', err.message, err.stack);
      return res.status(500).json(createErrorResponse(500, 'Failed to save fragment'));
    }

    const location = `${API_URL}/v1/fragments/${fragment.id}`;
    res.setHeader('Location', location);

    res.status(201).json(createSuccessResponse(fragment));
  } catch (err) {
    logger.error('Unexpected error in POST /fragments:', err.message, err.stack);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
