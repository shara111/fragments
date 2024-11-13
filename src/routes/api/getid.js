const { createErrorResponse } = require('../../response');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragments');

const validConversions = {
  'text/plain': ['.txt'],
  'text/markdown': ['.md', '.html', '.txt'],
  'text/html': ['.html', '.txt'],
  'text/csv': ['.csv', '.txt', '.json'],
  'application/json': ['.json', '.yaml', '.yml', '.txt'],
  'application/yaml': ['.yaml', '.txt'],
  'image/png': ['.png', '.jpg', '.webp', '.gif', '.avif'],
  'image/jpeg': ['.png', '.jpg', '.webp', '.gif', '.avif'],
  'image/webp': ['.png', '.jpg', '.webp', '.gif', '.avif'],
  'image/avif': ['.png', '.jpg', '.webp', '.gif', '.avif'],
  'image/gif': ['.png', '.jpg', '.webp', '.gif', '.avif'],
};

const getMimeTypeFromExtension = (extension) =>
  ({
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.html': 'text/html',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.yaml': 'application/yaml',
    '.yml': 'application/yaml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.avif': 'image/avif',
  })[extension] || 'application/octet-stream';

const getId = async (req, res) => {
  const { id } = req.params;
  const extension = id.includes('.') ? id.slice(id.lastIndexOf('.')) : null;

  try {
    const fragmentMetadata = await Fragment.byId(req.user, id);
    const fragment = new Fragment(fragmentMetadata);

    // Check if the extension is valid for conversion based on the fragment's MIME type
    if (extension && validConversions[fragment.mimeType]?.includes(extension)) {
      try {
        const convertedData = await fragment.convertTo(extension);

        return res.status(200).type(getMimeTypeFromExtension(extension)).send(convertedData);
      } catch (conversionError) {
        logger.error(`Conversion failed for fragment ${id} to ${extension}: ${conversionError}`);
        return res
          .status(415)
          .json(createErrorResponse(415, `Conversion to ${extension} not supported`));
      }
    }
    // Send the fragment data in its original MIME type if no valid conversion is required
    return res
      .status(200)
      .type(fragment.mimeType)
      .send(await fragment.getData());
  } catch (error) {
    logger.error(`Fragment with ID ${id} not found: ${error}`);
    return res.status(404).json(createErrorResponse(404, `Fragment with ID ${id} not found`));
  }
};

module.exports = getId;
