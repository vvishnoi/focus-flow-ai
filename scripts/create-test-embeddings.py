#!/usr/bin/env python3
"""
Create test embeddings for demo purposes
"""

import json
import boto3

bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')

# Sample research content about eye tracking
sample_chunks = [
    {
        "text": "Eye tracking accuracy refers to the precision with which an eye tracker can determine the point of gaze. High accuracy is crucial for research applications, typically requiring accuracy within 0.5-1.0 degrees of visual angle.",
        "paper": "eye-tracking-fundamentals",
        "chunk_id": 0
    },
    {
        "text": "Fixation duration is a key metric in eye tracking research. Longer fixations typically indicate increased cognitive processing or difficulty in information extraction. Average fixation durations range from 200-300ms in reading tasks.",
        "paper": "cognitive-eye-tracking",
        "chunk_id": 0
    },
    {
        "text": "Saccades are rapid eye movements between fixations. Saccade velocity and amplitude provide insights into visual search strategies and attention allocation. Typical saccade velocities range from 30-500 degrees per second.",
        "paper": "eye-movement-patterns",
        "chunk_id": 0
    },
    {
        "text": "Pupil dilation is associated with cognitive load and arousal. Increased pupil size often indicates higher mental effort or emotional engagement. This metric is valuable for assessing task difficulty and user engagement.",
        "paper": "pupillometry-research",
        "chunk_id": 0
    },
    {
        "text": "Smooth pursuit eye movements track moving objects. The quality of smooth pursuit can indicate attention and visual processing capabilities. Impaired smooth pursuit may suggest attention deficits or neurological conditions.",
        "paper": "pursuit-eye-movements",
        "chunk_id": 0
    }
]

def generate_embedding(text):
    """Generate embedding using Bedrock Titan"""
    try:
        response = bedrock_runtime.invoke_model(
            modelId='amazon.titan-embed-text-v1',
            body=json.dumps({'inputText': text})
        )
        result = json.loads(response['body'].read())
        return result['embedding']
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

print("Generating test embeddings...")
for i, chunk in enumerate(sample_chunks):
    print(f"  Processing chunk {i+1}/{len(sample_chunks)}...")
    embedding = generate_embedding(chunk['text'])
    if embedding:
        chunk['embedding'] = embedding
        chunk['id'] = f"test-{i}"
        chunk['token_count'] = len(chunk['text'].split())

output = {
    'version': '1.0',
    'total_chunks': len(sample_chunks),
    'papers': list(set(c['paper'] for c in sample_chunks)),
    'chunks': sample_chunks
}

print("\nUploading to S3...")
s3.put_object(
    Bucket='focusflow-bedrock-kb-dev',
    Key='research-embeddings.json',
    Body=json.dumps(output),
    ContentType='application/json'
)

print(f"✅ Created {len(sample_chunks)} test embeddings")
print(f"   Papers: {', '.join(output['papers'])}")
print("\nYou can now test the Lambda function!")
