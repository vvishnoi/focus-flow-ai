const { DynamoDBClient, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamoClient = new DynamoDBClient({});
const PROFILES_TABLE = process.env.PROFILES_TABLE_NAME;

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const therapistId = event.pathParameters?.therapistId;
    const profileId = event.pathParameters?.profileId;

    if (!therapistId || !profileId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing therapistId or profileId in path' 
        })
      };
    }

    // Delete profile
    await dynamoClient.send(new DeleteItemCommand({
      TableName: PROFILES_TABLE,
      Key: {
        therapistId: { S: therapistId },
        profileId: { S: profileId }
      }
    }));

    console.log(`Profile deleted: ${profileId}`);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Profile deleted successfully',
        profileId
      })
    };

  } catch (error) {
    console.error('Error deleting profile:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to delete profile',
        message: error.message
      })
    };
  }
};
