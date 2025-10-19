# Lambda RAG Setup Checklist

## ✅ What's Ready

- [x] Python processing script created
- [x] Lambda function code written
- [x] Deployment scripts created
- [x] Documentation complete
- [x] All scripts made executable

## 🚀 Next Steps (Run These)

### Option A: Automated Setup (Recommended)

```bash
./scripts/setup-lambda-rag.sh
```

This single command does everything!

### Option B: Manual Step-by-Step

```bash
# 1. Install Python dependencies
pip3 install -r scripts/requirements.txt

# 2. Process research papers (~2-5 minutes)
python3 scripts/process-research-papers.py backend/bedrock/knowledge-base/research/papers

# 3. Deploy Lambda function (~1 minute)
./scripts/deploy-research-rag.sh

# 4. Test the function
aws lambda invoke \
  --function-name focusflow-research-rag-dev \
  --payload '{"inputText":"eye tracking accuracy"}' \
  response.json && cat response.json | jq
```

## 📋 Prerequisites Check

Before running, ensure you have:

- [ ] Python 3 installed (`python3 --version`)
- [ ] pip installed (`pip3 --version`)
- [ ] Node.js installed (`node --version`)
- [ ] AWS CLI configured (`aws sts get-caller-identity`)
- [ ] Research papers in `backend/bedrock/knowledge-base/research/papers/`

## 💰 Cost Estimate

| Item | Cost |
|------|------|
| One-time setup (embeddings) | ~$0.50 |
| Monthly S3 storage | ~$0.10 |
| Monthly Lambda invocations | ~$2-5 |
| **Total Monthly** | **~$2-5** |

**Savings vs alternatives**: $95-695/month

## ⏱️ Time Estimate

- Automated setup: **5-10 minutes**
- Manual setup: **10-15 minutes**
- Connecting to Agent: **5 minutes**
- **Total**: **15-20 minutes**

## 🎯 Success Criteria

After setup, verify:

1. **S3 has embeddings**:
   ```bash
   aws s3 ls s3://focusflow-bedrock-kb-dev/research-embeddings.json
   ```

2. **Lambda function exists**:
   ```bash
   aws lambda get-function --function-name focusflow-research-rag-dev
   ```

3. **Test query works**:
   ```bash
   aws lambda invoke \
     --function-name focusflow-research-rag-dev \
     --payload '{"inputText":"test"}' \
     response.json
   ```

4. **Response contains research context**:
   ```bash
   cat response.json | jq '.body."application/json".body' | jq -r '.context'
   ```

## 📚 Documentation

- **Setup Guide**: `LAMBDA_RAG_SETUP.md`
- **Summary**: `LAMBDA_RAG_SUMMARY.md`
- **Design Rationale**: `KB_COST_EFFECTIVE_DESIGN.md`
- **Cost Comparison**: `KB_VECTOR_STORE_OPTIONS.md`

## 🔧 Troubleshooting

If something fails, check:

1. **AWS credentials**: `aws sts get-caller-identity`
2. **Bedrock access**: Enable Titan model in AWS console
3. **IAM permissions**: Lambda role needs S3 + Bedrock access
4. **Papers directory**: Contains PDF files
5. **Python packages**: `pip3 list | grep -E "PyPDF2|boto3"`

## 🎉 Ready to Go!

Run this command to start:

```bash
./scripts/setup-lambda-rag.sh
```

Then follow the prompts. The script will guide you through everything!
