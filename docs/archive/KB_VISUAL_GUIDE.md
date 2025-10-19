# Knowledge Base Setup - Visual Guide

## 🎯 Goal
Create a Knowledge Base that costs ~$2/month (vs $700/month for OpenSearch)

---

## 📸 Step-by-Step Screenshots Guide

### Step 1: Open Bedrock Console

```
AWS Console → Search "Bedrock" → Knowledge bases → Create knowledge base
```

**Direct Link**: https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/knowledge-bases

---

### Step 2: Knowledge Base Details

```
┌─────────────────────────────────────────────────────────┐
│ Create knowledge base                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Knowledge base details                                   │
│                                                          │
│ Name *                                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ focusflow-research-kb-dev                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Description (optional)                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Research papers on eye-gazing and attention         │ │
│ │ training                                            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ IAM permissions                                          │
│ ○ Create and use a new service role                     │
│ ● Use an existing service role                          │
│   ┌───────────────────────────────────────────────────┐ │
│   │ focusflow-kb-role-dev                             │ │
│   └───────────────────────────────────────────────────┘ │
│                                                          │
│                                    [Cancel]  [Next] ──→  │
└─────────────────────────────────────────────────────────┘
```

**Fill in:**
- Name: `focusflow-research-kb-dev`
- Description: `Research papers on eye-gazing and attention training`
- Select: "Use an existing service role"
- Choose: `focusflow-kb-role-dev`

Click **Next**

---

### Step 3: Data Source

```
┌─────────────────────────────────────────────────────────┐
│ Set up data source                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Data source details                                      │
│                                                          │
│ Data source name *                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ research-papers                                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ S3 location                                              │
│                                                          │
│ S3 URI *                                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ s3://focusflow-bedrock-kb-dev/papers/               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Browse S3]                                              │
│                                                          │
│                                    [Cancel]  [Next] ──→  │
└─────────────────────────────────────────────────────────┘
```

**Fill in:**
- Data source name: `research-papers`
- S3 URI: `s3://focusflow-bedrock-kb-dev/papers/`

Click **Next**

---

### Step 4: Embeddings Model

```
┌─────────────────────────────────────────────────────────┐
│ Select embeddings model                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Choose an embeddings model                               │
│                                                          │
│ ● Titan Embeddings G1 - Text                            │
│   Dimensions: 1536                                       │
│   Max input tokens: 8192                                 │
│   Cost: $0.0001 per 1K tokens                           │
│                                                          │
│ ○ Cohere Embed English v3                               │
│ ○ Cohere Embed Multilingual v3                          │
│                                                          │
│                                    [Cancel]  [Next] ──→  │
└─────────────────────────────────────────────────────────┘
```

**Select:**
- ● Titan Embeddings G1 - Text

Click **Next**

---

### Step 5: Vector Store (CRITICAL!)

```
┌─────────────────────────────────────────────────────────┐
│ Configure vector store                                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Vector database                                          │
│                                                          │
│ ● Quick create a new vector store - Recommended ⭐      │
│   Amazon Bedrock will create and manage a vector        │
│   store for you. No additional configuration needed.    │
│   Cost: Pay only for queries (~$2/month)                │
│                                                          │
│ ○ Choose a vector store you have created                │
│   - Amazon OpenSearch Serverless ($700/month)           │
│   - Amazon Aurora ($50/month)                           │
│   - Pinecone (external service)                         │
│   - Redis Enterprise Cloud (external service)           │
│                                                          │
│                                    [Cancel]  [Next] ──→  │
└─────────────────────────────────────────────────────────┘
```

**IMPORTANT: Select the first option!**
- ● Quick create a new vector store - Recommended

This is the key to keeping costs low!

Click **Next**

---

### Step 6: Review and Create

```
┌─────────────────────────────────────────────────────────┐
│ Review and create                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Knowledge base details                                   │
│ Name: focusflow-research-kb-dev                         │
│ IAM role: focusflow-kb-role-dev                         │
│                                                          │
│ Data source                                              │
│ Name: research-papers                                    │
│ S3 URI: s3://focusflow-bedrock-kb-dev/papers/          │
│                                                          │
│ Embeddings model                                         │
│ Model: Titan Embeddings G1 - Text                       │
│                                                          │
│ Vector store                                             │
│ Type: Amazon Bedrock managed                            │
│                                                          │
│                        [Cancel]  [Create knowledge base] │
└─────────────────────────────────────────────────────────┘
```

Review everything and click **Create knowledge base**

Wait ~1 minute...

---

### Step 7: Sync Data Source

```
┌─────────────────────────────────────────────────────────┐
│ focusflow-research-kb-dev                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Overview] [Data source] [Test knowledge base]          │
│                                                          │
│ Data sources                                             │
│                                                          │
│ ┌───────────────────────────────────────────────────┐   │
│ │ research-papers                                    │   │
│ │ Status: Not synced                                 │   │
│ │ S3: s3://focusflow-bedrock-kb-dev/papers/         │   │
│ │                                                    │   │
│ │                                          [Sync] ──→│   │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

Click **Sync**

Wait 2-3 minutes...

Status will change to: **Available** or **Synced**

---

### Step 8: Test It!

```
┌─────────────────────────────────────────────────────────┐
│ Test knowledge base                                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Enter your query:                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ What are the benefits of eye gazing for attention  │ │
│ │ training?                                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Run]                                                    │
│                                                          │
│ Results:                                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Eye gazing improves emotional regulation and        │ │
│ │ enhances focus training. Sustained eye contact      │ │
│ │ builds social connection and reduces anxiety...     │ │
│ │                                                     │ │
│ │ Source: s3://focusflow-bedrock-kb-dev/papers/      │ │
│ │         healthline-eye-gazing.html                  │ │
│ │ Confidence: 0.89                                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

Try queries like:
- "What are the benefits of eye gazing?"
- "How does eye contact help with anxiety?"
- "What is sustained attention?"

You should see results with citations!

---

## ✅ Success!

You now have a Knowledge Base that:
- ✅ Costs ~$2/month (vs $700/month)
- ✅ Searches research papers with AI
- ✅ Provides citations
- ✅ Works with Bedrock Agent
- ✅ Is fully managed by AWS

---

## 📝 Save This Information

After setup, note down:

1. **Knowledge Base ID**: (from URL or console)
2. **Knowledge Base ARN**: (from details page)
3. **Data Source ID**: (from data source tab)

You'll need these for:
- Integrating with Bedrock Agent
- Querying from code
- Adding more documents

---

## 🎉 What's Next?

Now that you have a Knowledge Base:

1. **Test more queries** to verify it works
2. **Add more research papers** to S3 and re-sync
3. **Integrate with Bedrock Agent** (Task 2)
4. **Query from your application** code

---

**Congratulations! You've created a cost-effective Knowledge Base!** 🎉

**Cost: ~$2/month vs $700/month = 99.7% savings!**
