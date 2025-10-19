/**
 * Research RAG Lambda Function
 * Provides research paper context to Bedrock Agent using in-memory vector search
 */

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

const BUCKET_NAME = process.env.BUCKET_NAME || 'focusflow-bedrock-kb-dev';
const EMBEDDINGS_KEY = process.env.EMBEDDINGS_KEY || 'research-embeddings.json';

// Cache for embeddings (persists across warm Lambda invocations)
let cachedEmbeddings = null;
let cacheTimestamp = null;
const CACHE_TTL = 3600000; // 1 hour

/**
 * Load research embeddings from S3 (with caching)
 */
async function loadEmbeddings() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedEmbeddings && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
    console.log('Using cached embeddings');
    return cachedEmbeddings;
  }
  
  console.log('Loading embeddings from S3...');
  
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: EMBEDDINGS_KEY
    });
    
    const response = await s3Client.send(command);
    const data = await streamToString(response.Body);
    const embeddings = JSON.parse(data);
    
    console.log(`Loaded ${embeddings.total_chunks} chunks from ${embeddings.papers.length} papers`);
    
    // Cache the data
    cachedEmbeddings = embeddings;
    cacheTimestamp = now;
    
    return embeddings;
  } catch (error) {
    console.error('Error loading embeddings:', error);
    throw new Error('Failed to load research embeddings');
  }
}

/**
 * Convert stream to string
 */
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * Generate embedding for query text using Bedrock
 */
async function generateQueryEmbedding(text) {
  try {
    const command = new InvokeModelCommand({
      modelId: 'amazon.titan-embed-text-v1',
      body: JSON.stringify({
        inputText: text
      })
    });
    
    const response = await bedrockClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    return result.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate query embedding');
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Search for relevant research chunks
 */
async function searchResearch(query, topK = 5) {
  console.log(`Searching for: "${query}" (top ${topK})`);
  
  // Load embeddings
  const data = await loadEmbeddings();
  
  // Generate query embedding
  const queryEmbedding = await generateQueryEmbedding(query);
  
  // Calculate similarity scores
  const scoredChunks = data.chunks.map(chunk => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  
  // Sort by similarity (descending)
  scoredChunks.sort((a, b) => b.similarity - a.similarity);
  
  // Return top K results
  const results = scoredChunks.slice(0, topK);
  
  console.log(`Found ${results.length} relevant chunks`);
  results.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.paper}] similarity: ${r.similarity.toFixed(3)}`);
  });
  
  return results;
}

/**
 * Format results for Bedrock Agent
 */
function formatResults(chunks) {
  if (!chunks || chunks.length === 0) {
    return 'No relevant research found.';
  }
  
  const formatted = chunks.map((chunk, index) => {
    return `
### Research Finding ${index + 1} (from ${chunk.paper})
Relevance Score: ${(chunk.similarity * 100).toFixed(1)}%

${chunk.text}
`;
  }).join('\n---\n');
  
  return formatted;
}

/**
 * Lambda handler
 */
exports.handler = async (event) => {
  console.log('Research RAG invoked:', JSON.stringify(event, null, 2));
  
  try {
    // Extract query from event
    // Bedrock Agent sends different formats depending on how it's called
    let query;
    let topK = 5;
    
    if (event.inputText) {
      // Direct invocation
      query = event.inputText;
      topK = event.topK || 5;
    } else if (event.requestBody && event.requestBody.content) {
      // Action group invocation
      const content = JSON.parse(event.requestBody.content);
      query = content.query || content.question || content.text;
      topK = content.topK || content.top_k || 5;
    } else if (typeof event === 'string') {
      // Simple string query
      query = event;
    } else {
      throw new Error('Could not extract query from event');
    }
    
    if (!query) {
      throw new Error('No query provided');
    }
    
    // Search for relevant research
    const results = await searchResearch(query, topK);
    
    // Format response
    const formattedContext = formatResults(results);
    
    // Return response in Bedrock Agent format
    const response = {
      statusCode: 200,
      body: {
        'application/json': {
          body: JSON.stringify({
            context: formattedContext,
            chunks: results.map(r => ({
              paper: r.paper,
              text: r.text.substring(0, 200) + '...',
              similarity: r.similarity
            })),
            query: query,
            resultsCount: results.length
          })
        }
      }
    };
    
    console.log('Response prepared successfully');
    return response;
    
  } catch (error) {
    console.error('Error in handler:', error);
    
    return {
      statusCode: 500,
      body: {
        'application/json': {
          body: JSON.stringify({
            error: error.message,
            context: 'Error retrieving research context. Please try again.'
          })
        }
      }
    };
  }
};
