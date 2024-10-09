// const logger = require('../../logger');
// const contentType = require('content-type');
// const { createErrorResponse, createSuccessResponse } = require('../../response');
// const { Fragment } = require('../../model/fragments');

// module.exports = async (req, res) => {
//   try {
//     // Parse the Content-Type from the request
//     const { type } = contentType.parse(req);
//     const fragBody = req.body;

//     // Log the Content-Type and Request Body for debugging
//     logger.info(`Content-Type: ${type}`);
//     logger.info(`Request Body: ${JSON.stringify(fragBody)}`);

//     // Validate content type
//     if (Fragment.isSupportedType(type)) {
//       // Check if the request body is a Buffer or string
//       if (Buffer.isBuffer(fragBody) || typeof fragBody === 'string') {
//         process.env.API_URL = 'http://' + req.headers.host;

//         // Ensure req.user is defined
//         if (!req.user) {
//           logger.warn('User is not authenticated');
//           return res.status(401).json(createErrorResponse(401, 'User not authenticated'));
//         }

//         const fragment = new Fragment({
//           ownerId: req.user,
//           type: type,
//           size: Buffer.byteLength(fragBody), // Set size based on the body length
//         });

//         // Save the fragment and set its data
//         await fragment.save();
//         await fragment.setData(fragBody);

//         // Set the location header
//         res.location(`${process.env.API_URL}/v1/fragments/${fragment.id}`);

//         // Send success response
//         res.status(201).json(createSuccessResponse({ fragment }));
//       } else {
//         // Invalid request body type
//         res.status(400).json(createErrorResponse(400, 'Invalid request body'));
//       }
//     } else {
//       // Unsupported content type
//       res.status(415).json(createErrorResponse(415, 'Unsupported content type'));
//     }
//   } catch (err) {
//     // Log and respond with error
//     logger.error('Error while creating fragment:', err.message);
//     res.status(500).json(createErrorResponse(500, `Internal Server error: ${err.message}`));
//   }
// };
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
