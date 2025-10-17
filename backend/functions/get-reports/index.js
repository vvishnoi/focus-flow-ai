const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamoClient = new DynamoDBClient({});
const REPORTS_TABLE = process.env.REPORTS_TABLE_NAME;

exports.handler = async (event) => {
  console.log('Get Reports invoked:', JSON.stringify(event, null, 2));

  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'userId is required' })
      };
    }

    // Query reports for user
    const response = await dynamoClient.send(new QueryCommand({
      TableName: REPORTS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId }
      },
      ScanIndexForward: false, // Sort by timestamp descending
      Limit: 50 // Last 50 sessions
    }));

    const reports = response.Items?.map(item => unmarshall(item)) || [];

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        reports,
        count: reports.length
      })
    };

  } catch (error) {
    console.error('Error fetching reports:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to fetch reports',
        message: error.message
      })
    };
  }
};
