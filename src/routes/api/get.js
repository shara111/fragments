const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragments');

/**
 
Get a list of fragments for the current user*/
const getAllFragment = async (req, res) => {
  try {
    const expand = req.query.expand || 0;
    const fragments = await Fragment.byUser(req.user, expand);
    logger.debug(`Fetched all fragments for user: ${req.user}`);
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (error) {
    logger.error(`Failed to get fragments for user ${req.user}: ${error}`);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};

module.exports = getAllFragment;
