const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamoClient = new DynamoDBClient({});
const PROFILES_TABLE = process.env.PROFILES_TABLE_NAME;

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const therapistId = event.pathParameters?.therapistId;

    if (!therapistId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing therapistId in path' 
        })
      };
    }

    // Query profiles for therapist
    const result = await dynamoClient.send(new QueryCommand({
      TableName: PROFILES_TABLE,
      KeyConditionExpression: 'therapistId = :therapistId',
      ExpressionAttributeValues: {
        ':therapistId': { S: therapistId }
      },
      ScanIndexForward: false // Most recent first
    }));

    // Convert DynamoDB format to regular objects
    const profiles = result.Items.map(item => {
      const profile = unmarshall(item);
      return {
        profileId: profile.profileId,
        therapistId: profile.therapistId,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      };
    });

    console.log(`Found ${profiles.length} profiles for therapist ${therapistId}`);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        therapistId,
        profiles,
        count: profiles.length
      })
    };

  } catch (error) {
    console.error('Error fetching profiles:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to fetch profiles',
        message: error.message
      })
    };
  }
};
