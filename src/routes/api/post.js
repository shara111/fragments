const { createSuccessResponse, createErrorResponse } = require('../../../src/response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragments');
require('dotenv').config();
const API_URL = process.env.API_URL || 'http://localhost:8080/';

module.exports = async (req, res) => {
  try {
    if (Buffer.isBuffer(req.body)) {
      const fragment = new Fragment({
        ownerId: req.user,
        type: req.headers['content-type'],
        size: Buffer.byteLength(req.body),
      });

      // Save the fragment and set its data
      await fragment.save();
      await fragment.setData(req.body);

      // Set the location header and respond with success
      res.setHeader('Location', `${API_URL}/v1/fragments/${fragment.id}`);
      const successResponse = createSuccessResponse(fragment);
      res.status(201).json(successResponse);
    } else {
      logger.debug('Received invalid body type:', typeof req.body);
      res.status(415).json(createErrorResponse(415, 'Not a valid type'));
    }
  } catch (err) {
    logger.error('Error while creating fragment:', err.message);
    res.status(500).json(createErrorResponse(500, `Internal Server error: ${err.message}`));
  }
};
