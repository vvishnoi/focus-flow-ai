# Knowledge Base Setup - Quick Reference Card

## 📋 Information You'll Need

### IAM Role ARN
```
arn:aws:iam::394686422000:role/focusflow-kb-role-dev
```

### S3 Bucket
```
s3://focusflow-bedrock-kb-dev/papers/
```

### Knowledge Base Name
```
focusflow-research-kb-dev
```

---

## 🚀 AWS Console Steps (5 minutes)

### 1. Open AWS Bedrock Console
**URL**: https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/knowledge-bases

Or:
1. Go to AWS Console
2. Search for "Bedrock"
3. Click "Knowledge bases" in left menu
4. Click "Create knowledge base"

---

### 2. Knowledge Base Details

**Page 1: Provide knowledge base details**

| Field | Value |
|-------|-------|
| Name | `focusflow-research-kb-dev` |
| Description | `Research papers on eye-gazing and attention training` |
| IAM role | Select existing role: `focusflow-kb-role-dev` |

Click **Next**

---

### 3. Data Source

**Page 2: Set up data source**

| Field | Value |
|-------|-------|
| Data source name | `research-papers` |
| S3 URI | `s3://focusflow-bedrock-kb-dev/papers/` |

Click **Next**

---

### 4. Embeddings Model

**Page 3: Select embeddings model**

| Field | Value |
|-------|-------|
| Embeddings model | `Titan Embeddings G1 - Text` |

Click **Next**

---

### 5. Vector Store (IMPORTANT!)

**Page 4: Configure vector store**

⭐ **Select: "Quick create a new vector store - Recommended"**

This uses Amazon Bedrock managed storage (no extra cost!)

Click **Next**

---

### 6. Review and Create

**Page 5: Review and create**

Review all settings and click **Create knowledge base**

Wait ~1 minute for creation to complete.

---

### 7. Sync Data Source

After creation:

1. You'll see your Knowledge Base page
2. Go to "Data source" tab
3. Click the **"Sync"** button
4. Wait 2-3 minutes for sync to complete
5. Status should show **"Available"** or **"Synced"**

---

### 8. Test It!

1. Go to "Test knowledge base" tab
2. Enter a query:
   ```
   What are the benefits of eye gazing for attention training?
   ```
3. You should see results from the Healthline article!
4. Check that citations are included

---

## ✅ Success Checklist

- [ ] Knowledge Base created
- [ ] Data source added
- [ ] Sync completed successfully
- [ ] Test query returns results
- [ ] Citations are included

---

## 📊 After Setup

### Get Knowledge Base ID

1. In the Knowledge Base page, look at the URL
2. Copy the ID (looks like: `ABCDEFGHIJ`)
3. Or run:
   ```bash
   aws bedrock-agent list-knowledge-bases --query 'knowledgeBaseSummaries[?name==`focusflow-research-kb-dev`].knowledgeBaseId' --output text
   ```

### Save for Later

You'll need the Knowledge Base ID for:
- Integrating with Bedrock Agent
- Querying from code
- Adding more documents

---

## 💰 Cost Estimate

For your usage (estimated 1,000 queries/month):
- Embeddings: $0.005 (one-time)
- Queries: $2.00/month
- S3: $0.0002/month
- **Total: ~$2/month**

---

## 🐛 Troubleshooting

### Can't find IAM role?
- Make sure you're in the correct AWS region (us-east-1)
- Role name: `focusflow-kb-role-dev`

### Sync fails?
- Check S3 bucket has files: `aws s3 ls s3://focusflow-bedrock-kb-dev/papers/`
- Verify IAM role has S3 permissions

### No results from test?
- Wait for sync to complete (check status)
- Try re-syncing the data source
- Check that files are in the correct S3 path

---

## 📞 Need Help?

If you get stuck, share:
1. Screenshot of the error
2. Which step you're on
3. Any error messages

I'll help you troubleshoot!

---

**Ready? Let's create your Knowledge Base!** 🚀

**Start here**: https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/knowledge-bases
