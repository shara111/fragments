const { s3, BUCKET_NAME } = require('./s3Client');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../../../logger'); // Adjust the path if necessary
const ddbDocClient = require('./ddbDocClient');

// Convert a stream of data into a Buffer (unused; remove or suppress linting)
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Writes a fragment to DynamoDB
async function writeFragmentData(fragment) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };

  const command = new PutCommand(params);

  try {
    return ddbDocClient.send(command);
  } catch (err) {
    logger.warn({ err, params, fragment }, 'Error writing fragment to DynamoDB');
    throw err;
  }
}

// Reads a fragment from DynamoDB
async function readFragmentData(ownerId, id) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  const command = new GetCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'Error reading fragment from DynamoDB');
    throw err;
  }
}

// List fragments
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: { ':ownerId': ownerId },
  };

  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  const command = new QueryCommand(params);

  try {
    const data = await ddbDocClient.send(command);
    return !expand ? data?.Items.map((item) => item.id) : data?.Items;
  } catch (err) {
    logger.error({ err, params }, 'Error getting fragments from DynamoDB');
    throw err;
  }
}

// Delete a fragment's metadata and data
async function deleteFragment(ownerId, id) {
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const deleteS3Command = new DeleteObjectCommand(s3Params);

  try {
    await s3.send(deleteS3Command);
    logger.info({ Bucket: s3Params.Bucket, Key: s3Params.Key }, 'Deleted fragment data from S3');
  } catch (err) {
    logger.error({ err, Bucket: s3Params.Bucket, Key: s3Params.Key }, 'Error deleting fragment data from S3');
    throw new Error('Unable to delete fragment data from S3');
  }

  const dynamoParams = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  const deleteDynamoCommand = new DeleteCommand(dynamoParams);

  try {
    await ddbDocClient.send(deleteDynamoCommand);
    logger.info({ TableName: dynamoParams.TableName, Key: dynamoParams.Key }, 'Deleted fragment metadata from DynamoDB');
  } catch (err) {
    logger.error({ err, TableName: dynamoParams.TableName, Key: dynamoParams.Key }, 'Error deleting fragment metadata from DynamoDB');
    throw new Error('Unable to delete fragment metadata from DynamoDB');
  }
}

module.exports = {
  listFragments,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
};
