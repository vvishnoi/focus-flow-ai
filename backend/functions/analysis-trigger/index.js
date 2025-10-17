const { BedrockAgentRuntimeClient, InvokeAgentCommand } = require('@aws-sdk/client-bedrock-agent-runtime');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const bedrockClient = new BedrockAgentRuntimeClient({});
const dynamoClient = new DynamoDBClient({});

const AGENT_ID = process.env.BEDROCK_AGENT_ID;
const AGENT_ALIAS_ID = process.env.BEDROCK_AGENT_ALIAS_ID;
const REPORTS_TABLE = process.env.REPORTS_TABLE_NAME;

exports.handler = async (event) => {
  console.log('Analysis Trigger invoked:', JSON.stringify(event, null, 2));

  try {
    // Parse S3 event
    const record = event.Records[0];
    const bucketName = record.s3.bucket.name;
    const s3Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing session: ${s3Key}`);

    // Extract userId and sessionId from S3 key
    // Format: sessions/{userId}/{sessionId}_{timestamp}.json
    const pathParts = s3Key.split('/');
    const userId = pathParts[1];
    const fileName = pathParts[2];
    const sessionId = fileName.split('_')[0];

    // Invoke Bedrock Agent
    const prompt = `Analyze the eye-tracking session data stored at s3://${bucketName}/${s3Key}. 
    
Please:
1. Use the MetricsCalculator tool to get the performance metrics
2. Compare the metrics against age-appropriate benchmarks from the knowledge base
3. Generate a comprehensive, encouraging report for parents and therapists
4. Include specific recommendations for improvement

Session Details:
- User ID: ${userId}
- Session ID: ${sessionId}
- S3 Location: ${bucketName}/${s3Key}`;

    const command = new InvokeAgentCommand({
      agentId: AGENT_ID,
      agentAliasId: AGENT_ALIAS_ID,
      sessionId: `${userId}-${sessionId}`,
      inputText: prompt
    });

    console.log('Invoking Bedrock Agent...');
    const response = await bedrockClient.send(command);

    // Collect the streaming response
    let fullResponse = '';
    for await (const chunk of response.completion) {
      if (chunk.chunk && chunk.chunk.bytes) {
        const text = new TextDecoder().decode(chunk.chunk.bytes);
        fullResponse += text;
      }
    }

    console.log('Agent response received');

    // Store the report in DynamoDB
    const timestamp = Date.now();
    await dynamoClient.send(new PutItemCommand({
      TableName: REPORTS_TABLE,
      Item: {
        userId: { S: userId },
        sessionId: { S: sessionId },
        timestamp: { N: timestamp.toString() },
        report: { S: fullResponse },
        s3Key: { S: s3Key },
        generatedAt: { N: timestamp.toString() },
        modelUsed: { S: 'claude-sonnet-4.5' }
      }
    }));

    console.log('Report stored in DynamoDB');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Analysis complete',
        userId,
        sessionId,
        reportLength: fullResponse.length
      })
    };

  } catch (error) {
    console.error('Error processing analysis:', error);
    throw error;
  }
};
