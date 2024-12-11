const { updateFragment, getFragmentById } = require('./fragment'); // Import necessary functions
const logger = require('./logger');

/**
 * PUT /v1/fragments/:id
 * Updates an existing fragment for an authenticated user.
 */
module.exports = async (req, res) => {
  try {
    const ownerId = req.user; // Retrieve the authenticated user
    const { id } = req.params; // Retrieve the fragment ID from the URL
    const contentType = req.headers['content-type']; // Get the content type
    const body = req.body; // Get the request body

    // Log request details for debugging
    logger.debug(`Authenticated user: ${ownerId}`);
    logger.debug(`Received Content-Type: ${contentType}`);
    logger.debug(`Request body: ${body}`);

    // Check if the fragment exists for the user
    const existingFragment = await getFragmentById(ownerId, id);

    if (!existingFragment) {
      logger.info(`Fragment not found: ${id}`);
      return res.status(404).json({ error: 'Fragment not found' });
    }

    // Validate the content type (use your validation function)
    const supportedTypes = existingFragment.formats || [];
    if (!supportedTypes.includes(contentType)) {
      logger.info(`Unsupported Content-Type: ${contentType}`);
      return res.status(400).json({ error: 'Unsupported Content-Type' });
    }

    // Update the fragment with the new data
    await updateFragment(ownerId, id, contentType, body);
    logger.info(`Fragment updated: ${id}`);

    // Return updated fragment metadata
    const updatedFragment = await getFragmentById(ownerId, id);
    res.status(200).json(updatedFragment);
  } catch (err) {
    logger.error(`Error updating fragment: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
