// Assuming these are your data and metadata access modules
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragments');

async function deleteFragment(ownerId, id) {
  try {
    // Check if the fragment exists in metadata and data
    const fragmentExists = await metadata.get(ownerId, id);
    const dataExists = await data.get(ownerId, id);

    // If neither the fragment nor the data exists, return false (nothing to delete)
    if (!fragmentExists && !dataExists) {
      return false;  // Fragment and associated data not found
    }

    // Proceed to delete the fragment from both metadata and data storage
    await Promise.all([
      fragmentExists ? metadata.del(ownerId, id) : null,
      dataExists ? data.del(ownerId, id) : null
    ]);

    return true;  // Successfully deleted
  } catch (error) {
    // Handle any errors that occur during the deletion process
    console.error('Error during deletion:', error);
    throw new Error('Error deleting fragment');
  }
}

module.exports = { deleteFragment };
