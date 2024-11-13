const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragments');

const getInfo = async (req, res) => {
  try {
    const fragmentMetadata = await Fragment.byId(req.user, req.params.id);
    res.status(200).json(createSuccessResponse({ fragment: fragmentMetadata }));
  } catch (error) {
    logger.error(`Fragment metadata not found for ID ${req.params.id}: ${error}`);
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};

module.exports = getInfo;