const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const s3Client = new S3Client({});
const dynamoClient = new DynamoDBClient({});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const USERS_TABLE = process.env.USERS_TABLE_NAME;

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { 
      userId, 
      sessionId, 
      profileId,
      profileName,
      profileAge,
      profileGender,
      profileWeight,
      profileHeight,
      level, 
      startTime, 
      endTime,
      sessionDuration,
      datePlayed,
      gazeData, 
      events,
      metrics
    } = body;

    // Validate required fields
    if (!userId || !sessionId || !level || !profileId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing required fields: userId, sessionId, profileId, level' })
      };
    }

    // Create S3 key
    const timestamp = Date.now();
    const s3Key = `sessions/${userId}/${sessionId}_${timestamp}.json`;

    // Store session data in S3
    const sessionData = {
      userId,
      sessionId,
      profileId,
      profileName,
      profileAge,
      profileGender,
      profileWeight,
      profileHeight,
      level,
      startTime,
      endTime,
      sessionDuration,
      datePlayed,
      gazeData,
      events,
      metrics,
      uploadedAt: timestamp
    };

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: JSON.stringify(sessionData),
      ContentType: 'application/json'
    }));

    console.log(`Session data stored in S3: ${s3Key}`);

    // Update user record in DynamoDB
    const userItem = {
      userId: { S: userId },
      profileId: { S: profileId },
      profileName: { S: profileName },
      profileAge: { N: profileAge.toString() },
      profileGender: { S: profileGender },
      lastSessionId: { S: sessionId },
      lastSessionTime: { N: timestamp.toString() },
      lastLevel: { S: level },
      lastSessionDuration: { N: sessionDuration ? sessionDuration.toString() : '0' },
      lastAccuracy: { N: (metrics?.accuracyPercentage || 0).toString() },
      updatedAt: { N: timestamp.toString() }
    };
    
    // Add optional fields
    if (profileWeight) {
      userItem.profileWeight = { N: profileWeight.toString() };
    }
    if (profileHeight) {
      userItem.profileHeight = { N: profileHeight.toString() };
    }
    
    await dynamoClient.send(new PutItemCommand({
      TableName: USERS_TABLE,
      Item: userItem
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Session data received successfully',
        s3Key,
        sessionId
      })
    };

  } catch (error) {
    console.error('Error processing session data:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to process session data',
        message: error.message
      })
    };
  }
};
