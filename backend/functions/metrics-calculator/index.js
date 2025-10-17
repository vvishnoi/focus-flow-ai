const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({});

exports.handler = async (event) => {
  console.log('Metrics Calculator invoked:', JSON.stringify(event, null, 2));

  try {
    const { s3Key, bucketName } = event;

    // Fetch session data from S3
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key
    }));

    const sessionData = JSON.parse(await response.Body.transformToString());
    
    // Calculate metrics
    const metrics = calculateMetrics(sessionData);

    return {
      statusCode: 200,
      body: metrics
    };

  } catch (error) {
    console.error('Error calculating metrics:', error);
    throw error;
  }
};

function calculateMetrics(sessionData) {
  const { level, gazeData, startTime, endTime } = sessionData;
  
  // Calculate duration
  const duration = (endTime - startTime) / 1000; // seconds

  // Calculate tracking accuracy
  const totalPoints = gazeData.length;
  const trackedPoints = gazeData.filter(d => d.objectId !== null).length;
  const trackingAccuracy = totalPoints > 0 ? (trackedPoints / totalPoints) * 100 : 0;

  // Calculate time on target
  const timeOnTarget = (trackedPoints / totalPoints) * duration;

  // Calculate average distance from target
  let totalDistance = 0;
  let distanceCount = 0;

  gazeData.forEach(point => {
    if (point.objectId) {
      const dx = point.gazeX - point.objectX;
      const dy = point.gazeY - point.objectY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      totalDistance += distance;
      distanceCount++;
    }
  });

  const avgDistanceFromTarget = distanceCount > 0 ? totalDistance / distanceCount : 0;

  // Calculate focus score (0-100)
  const focusScore = Math.round(
    (trackingAccuracy * 0.7) + 
    (Math.max(0, 100 - (avgDistanceFromTarget / 10)) * 0.3)
  );

  return {
    level,
    duration: Math.round(duration),
    trackingAccuracy: Math.round(trackingAccuracy * 10) / 10,
    timeOnTarget: Math.round(timeOnTarget * 10) / 10,
    avgDistanceFromTarget: Math.round(avgDistanceFromTarget),
    focusScore,
    totalDataPoints: totalPoints,
    trackedDataPoints: trackedPoints,
    calculatedAt: Date.now()
  };
}
