#!/usr/bin/env python3
"""
Process research papers: Extract text, chunk, and generate embeddings
"""

import json
import os
import sys
from pathlib import Path
import boto3
from typing import List, Dict
import hashlib

# Check for required packages
try:
    import PyPDF2
except ImportError:
    print("Error: PyPDF2 not installed. Run: pip install PyPDF2")
    sys.exit(1)

# AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')

# Configuration
CHUNK_SIZE = 500  # tokens (roughly 400 words)
OVERLAP = 50      # token overlap between chunks
BUCKET_NAME = 'focusflow-bedrock-kb-dev'
OUTPUT_KEY = 'research-embeddings.json'

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF file"""
    print(f"  Extracting text from {pdf_path}...")
    text = ""
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page_num, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- Page {page_num + 1} ---\n{page_text}"
    except Exception as e:
        print(f"  Error extracting text: {e}")
        return ""
    
    return text.strip()

def chunk_text(text: str, paper_name: str) -> List[Dict]:
    """Split text into overlapping chunks"""
    print(f"  Chunking text...")
    
    # Simple sentence-based chunking
    sentences = text.replace('\n', ' ').split('. ')
    chunks = []
    current_chunk = []
    current_length = 0
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        # Rough token count (1 token ≈ 4 characters)
        sentence_tokens = len(sentence) // 4
        
        if current_length + sentence_tokens > CHUNK_SIZE and current_chunk:
            # Save current chunk
            chunk_text = '. '.join(current_chunk) + '.'
            chunks.append({
                'text': chunk_text,
                'paper': paper_name,
                'chunk_id': len(chunks),
                'token_count': current_length
            })
            
            # Start new chunk with overlap
            overlap_sentences = current_chunk[-2:] if len(current_chunk) > 2 else current_chunk
            current_chunk = overlap_sentences + [sentence]
            current_length = sum(len(s) // 4 for s in current_chunk)
        else:
            current_chunk.append(sentence)
            current_length += sentence_tokens
    
    # Add final chunk
    if current_chunk:
        chunk_text = '. '.join(current_chunk) + '.'
        chunks.append({
            'text': chunk_text,
            'paper': paper_name,
            'chunk_id': len(chunks),
            'token_count': current_length
        })
    
    print(f"  Created {len(chunks)} chunks")
    return chunks

def generate_embedding(text: str) -> List[float]:
    """Generate embedding using Bedrock Titan"""
    try:
        response = bedrock_runtime.invoke_model(
            modelId='amazon.titan-embed-text-v1',
            body=json.dumps({
                'inputText': text
            })
        )
        
        result = json.loads(response['body'].read())
        return result['embedding']
    except Exception as e:
        print(f"  Error generating embedding: {e}")
        return None

def process_papers(papers_dir: str) -> List[Dict]:
    """Process all PDF papers in directory"""
    papers_path = Path(papers_dir)
    
    if not papers_path.exists():
        print(f"Error: Directory {papers_dir} not found")
        return []
    
    pdf_files = list(papers_path.glob('*.pdf'))
    
    if not pdf_files:
        print(f"No PDF files found in {papers_dir}")
        return []
    
    print(f"\nFound {len(pdf_files)} PDF files")
    
    all_chunks = []
    
    for pdf_file in pdf_files:
        print(f"\nProcessing: {pdf_file.name}")
        
        # Extract text
        text = extract_text_from_pdf(str(pdf_file))
        if not text:
            print(f"  Skipping (no text extracted)")
            continue
        
        # Chunk text
        chunks = chunk_text(text, pdf_file.stem)
        
        # Generate embeddings
        print(f"  Generating embeddings...")
        for i, chunk in enumerate(chunks):
            if i % 10 == 0:
                print(f"    Progress: {i}/{len(chunks)}")
            
            embedding = generate_embedding(chunk['text'])
            if embedding:
                chunk['embedding'] = embedding
                chunk['id'] = hashlib.md5(
                    f"{chunk['paper']}-{chunk['chunk_id']}".encode()
                ).hexdigest()
                all_chunks.append(chunk)
        
        print(f"  ✓ Processed {len(chunks)} chunks")
    
    return all_chunks

def upload_to_s3(chunks: List[Dict]):
    """Upload processed chunks to S3"""
    print(f"\nUploading to S3: s3://{BUCKET_NAME}/{OUTPUT_KEY}")
    
    # Create compact JSON
    output = {
        'version': '1.0',
        'total_chunks': len(chunks),
        'papers': list(set(c['paper'] for c in chunks)),
        'chunks': chunks
    }
    
    try:
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=OUTPUT_KEY,
            Body=json.dumps(output),
            ContentType='application/json'
        )
        print(f"✓ Uploaded {len(chunks)} chunks")
        
        # Calculate size
        size_mb = len(json.dumps(output)) / (1024 * 1024)
        print(f"  File size: {size_mb:.2f} MB")
        
    except Exception as e:
        print(f"Error uploading to S3: {e}")
        # Save locally as backup
        with open('research-embeddings.json', 'w') as f:
            json.dump(output, f)
        print("  Saved locally as research-embeddings.json")

def main():
    if len(sys.argv) < 2:
        print("Usage: python process-research-papers.py <papers_directory>")
        print("Example: python process-research-papers.py backend/bedrock/knowledge-base/papers")
        sys.exit(1)
    
    papers_dir = sys.argv[1]
    
    print("=" * 60)
    print("Research Paper Processing Pipeline")
    print("=" * 60)
    
    # Process papers
    chunks = process_papers(papers_dir)
    
    if not chunks:
        print("\nNo chunks generated. Exiting.")
        sys.exit(1)
    
    print(f"\n{'=' * 60}")
    print(f"Summary:")
    print(f"  Total chunks: {len(chunks)}")
    print(f"  Papers processed: {len(set(c['paper'] for c in chunks))}")
    print(f"  Avg chunk size: {sum(c['token_count'] for c in chunks) / len(chunks):.0f} tokens")
    print(f"{'=' * 60}")
    
    # Upload to S3
    upload_to_s3(chunks)
    
    print("\n✅ Processing complete!")
    print(f"\nNext steps:")
    print(f"  1. Deploy the Lambda function")
    print(f"  2. Connect to Bedrock Agent")
    print(f"  3. Test the research lookup")

if __name__ == '__main__':
    main()
