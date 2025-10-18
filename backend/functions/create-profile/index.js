const { DynamoDBClient, PutItemCommand, QueryCommand } = require('@aws-sdk/client-dynamodb');

const dynamoClient = new DynamoDBClient({});
const PROFILES_TABLE = process.env.PROFILES_TABLE_NAME;

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const { therapistId, name, age, gender, weight, height } = body;

    // Validate required fields
    if (!therapistId || !name || !age) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: therapistId, name, age' 
        })
      };
    }

    // Validate age range
    if (age < 3 || age > 18) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Age must be between 3 and 18' 
        })
      };
    }

    // Get next profile number from DynamoDB
    let profileNumber = 1;
    try {
      // Query all profiles for this therapist to get the count
      const existingProfiles = await dynamoClient.send(new QueryCommand({
        TableName: PROFILES_TABLE,
        KeyConditionExpression: 'therapistId = :therapistId',
        ExpressionAttributeValues: {
          ':therapistId': { S: therapistId }
        },
        Select: 'COUNT'
      }));
      profileNumber = (existingProfiles.Count || 0) + 1;
    } catch (error) {
      console.log('Could not get profile count, using default:', error);
    }
    
    // Generate sequential profile ID in FOC-XXX format
    const profileId = `FOC-${profileNumber.toString().padStart(3, '0')}`;
    const timestamp = Date.now();
    
    console.log(`Generating profile ID: ${profileId} for therapist: ${therapistId}`);

    // Create profile item
    const item = {
      therapistId: { S: therapistId },
      profileId: { S: profileId },
      name: { S: name },
      age: { N: age.toString() },
      gender: { S: gender || 'prefer-not-to-say' },
      createdAt: { N: timestamp.toString() },
      updatedAt: { N: timestamp.toString() }
    };

    // Add optional fields
    if (weight) {
      item.weight = { N: weight.toString() };
    }
    if (height) {
      item.height = { N: height.toString() };
    }

    // Store in DynamoDB
    await dynamoClient.send(new PutItemCommand({
      TableName: PROFILES_TABLE,
      Item: item
    }));

    console.log(`Profile created: ${profileId}`);

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Profile created successfully',
        profile: {
          profileId,
          therapistId,
          name,
          age,
          gender: gender || 'prefer-not-to-say',
          weight,
          height,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      })
    };

  } catch (error) {
    console.error('Error creating profile:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to create profile',
        message: error.message
      })
    };
  }
};
