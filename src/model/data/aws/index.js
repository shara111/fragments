const { s3, BUCKET_NAME } = require('./s3Client');
const { PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger'); // Adjust the path if necessary
const s3Client = require('./s3Client');
const ddbDocClient = require('./ddbDocClient');


// Convert a stream of data into a Buffer
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Writes a fragment to DynamoDB. Returns a Promise.
function writeFragmentData(fragment) {
  // Configure our PUT params, with the name of the table and item (attributes and keys)
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };

  // Create a PUT command to send to DynamoDB
  const command = new PutCommand(params);

  try {
    return ddbDocClient.send(command);
  } catch (err) {
    logger.warn({ err, params, fragment }, 'error writing fragment to DynamoDB');
    throw err;
  }
}

// Reads a fragment from DynamoDB. Returns a Promise<fragment|undefined>
async function readFragmentData(ownerId, id) {
  // Configure our GET params, with the name of the table and key (partition key + sort key)
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  // Create a GET command to send to DynamoDB
  const command = new GetCommand(params);

  try {
    // Wait for the data to come back from AWS
    const data = await ddbDocClient.send(command);
    // We may or may not get back any data (e.g., no item found for the given key).
    // If we get back an item (fragment), we'll return it.  Otherwise we'll return `undefined`.
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'error reading fragment from DynamoDB');
    throw err;
  }
}

// Get a list of fragments, either ids-only, or full Objects, for the given user.
// Returns a Promise<Array<Fragment>|Array<string>|undefined>
async function listFragments(ownerId, expand = false) {
  // Configure our QUERY params, with the name of the table and the query expression
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    // Specify that we want to get all items where the ownerId is equal to the
    // `:ownerId` that we'll define below in the ExpressionAttributeValues.
    KeyConditionExpression: 'ownerId = :ownerId',
    // Use the `ownerId` value to do the query
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  // Limit to only `id` if we aren't supposed to expand. Without doing this
  // we'll get back every attribute.  The projection expression defines a list
  // of attributes to return, see:
  // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ProjectionExpressions.html
  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  // Create a QUERY command to send to DynamoDB
  const command = new QueryCommand(params);

  try {
    // Wait for the data to come back from AWS
    const data = await ddbDocClient.send(command);

    // If we haven't expanded to include all attributes, remap this array from
    // [ {"id":"b9e7a264-630f-436d-a785-27f30233faea"}, {"id":"dad25b07-8cd6-498b-9aaf-46d358ea97fe"} ,... ] to
    // [ "b9e7a264-630f-436d-a785-27f30233faea", "dad25b07-8cd6-498b-9aaf-46d358ea97fe", ... ]
    return !expand ? data?.Items.map((item) => item.id) : data?.Items
  } catch (err) {
    logger.error({ err, params }, 'error getting all fragments for user from DynamoDB');
    throw err;
  }
}
// Delete a fragment's metadata and data from S3 and DynamoDB
async function deleteFragment(ownerId, id) {
  // Delete fragment data from S3
  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const deleteS3Command = new DeleteObjectCommand(s3Params);

  try {
    await s3.send(deleteS3Command);
    logger.info({ Bucket: s3Params.Bucket, Key: s3Params.Key }, 'Successfully deleted fragment data from S3');
  } catch (err) {
    logger.error({ err, Bucket: s3Params.Bucket, Key: s3Params.Key }, 'Error deleting fragment data from S3');
    throw new Error('Unable to delete fragment data from S3');
  }

  // Delete fragment metadata from DynamoDB
  const dynamoParams = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  const deleteDynamoCommand = new DeleteCommand(dynamoParams);

  try {
    await ddbDocClient.send(deleteDynamoCommand);
    logger.info({ TableName: dynamoParams.TableName, Key: dynamoParams.Key }, 'Successfully deleted fragment metadata from DynamoDB');
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
