const { s3, BUCKET_NAME } = require('./s3Client');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../../../logger'); // Adjust the path if necessary
const metadata = require('../../memory-db'); // Adjust the path if necessary

// Convert a stream of data into a Buffer
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Write a fragment's data buffer to S3
async function writeFragmentData(ownerId, id, buffer) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: buffer,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3.send(command);
  } catch (err) {
    logger.error({ err, Bucket: params.Bucket, Key: params.Key }, 'Error uploading fragment data to S3');
    throw new Error('Unable to upload fragment data');
  }
}

// Read a fragment's data from S3
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new GetObjectCommand(params);

  try {
    const data = await s3.send(command);
    return streamToBuffer(data.Body);
  } catch (err) {
    logger.error({ err, Bucket: params.Bucket, Key: params.Key }, 'Error streaming fragment data from S3');
    throw new Error('Unable to read fragment data');
  }
}

// List fragment IDs/objects for the given user
async function listFragments(ownerId, expand = false) {
  const fragments = await metadata.query(ownerId);
  return expand || !fragments ? fragments : fragments.map((fragment) => fragment.id);
}

// Delete a fragment's metadata and data from S3
async function deleteFragment(ownerId, id) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new DeleteObjectCommand(params);

  try {
    await s3.send(command);
  } catch (err) {
    logger.error({ err, Bucket: params.Bucket, Key: params.Key }, 'Error deleting fragment data from S3');
    throw new Error('Unable to delete fragment data');
  }

  await metadata.del(ownerId, id);
}

module.exports = {
  listFragments,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
};
