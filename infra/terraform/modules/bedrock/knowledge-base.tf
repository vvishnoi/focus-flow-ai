# Cost-Effective Bedrock Knowledge Base using Bedrock Managed Storage
# No vector database needed! Bedrock handles everything internally.
# Cost: ~$2-10/month vs $700/month for OpenSearch

# This uses Bedrock's built-in storage which:
# - Creates embeddings automatically
# - Stores them internally (managed by AWS)
# - Handles indexing and search
# - Perfect for small to medium document sets (<100 docs)
# - Pay only for queries and embeddings

# IAM role for Knowledge Base
resource "aws_iam_role" "knowledge_base" {
  name = "${var.project_name}-kb-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "bedrock.amazonaws.com"
      }
      Condition = {
        StringEquals = {
          "aws:SourceAccount" = data.aws_caller_identity.current.account_id
        }
        ArnLike = {
          "aws:SourceArn" = "arn:aws:bedrock:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:knowledge-base/*"
        }
      }
    }]
  })

  tags = {
    Name = "${var.project_name}-kb-role-${var.environment}"
  }
}

# Policy for Knowledge Base to access S3
resource "aws_iam_role_policy" "knowledge_base_s3" {
  name = "${var.project_name}-kb-s3-policy-${var.environment}"
  role = aws_iam_role.knowledge_base.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.knowledge_base.arn,
          "${aws_s3_bucket.knowledge_base.arn}/*"
        ]
        Condition = {
          StringEquals = {
            "aws:PrincipalAccount" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })
}

# Policy for Knowledge Base to use embedding model
resource "aws_iam_role_policy" "knowledge_base_model" {
  name = "${var.project_name}-kb-model-policy-${var.environment}"
  role = aws_iam_role.knowledge_base.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "bedrock:InvokeModel"
      ]
      Resource = "arn:aws:bedrock:${data.aws_region.current.name}::foundation-model/amazon.titan-embed-text-v1"
    }]
  })
}

# Bedrock Knowledge Base
resource "aws_bedrockagent_knowledge_base" "research" {
  name        = "${var.project_name}-research-kb-${var.environment}"
  description = "Knowledge base for eye-gazing and attention training research papers"
  role_arn    = aws_iam_role.knowledge_base.arn

  knowledge_base_configuration {
    type = "VECTOR"
    vector_knowledge_base_configuration {
      embedding_model_arn = "arn:aws:bedrock:${data.aws_region.current.name}::foundation-model/amazon.titan-embed-text-v1"
    }
  }

  storage_configuration {
    type = "OPENSEARCH_SERVERLESS"
    opensearch_serverless_configuration {
      collection_arn    = aws_opensearchserverless_collection.knowledge_base.arn
      vector_index_name = "bedrock-knowledge-base-default-index"
      field_mapping {
        vector_field   = "bedrock-knowledge-base-default-vector"
        text_field     = "AMAZON_BEDROCK_TEXT_CHUNK"
        metadata_field = "AMAZON_BEDROCK_METADATA"
      }
    }
  }

  tags = {
    Name = "${var.project_name}-research-kb-${var.environment}"
  }

  depends_on = [
    aws_iam_role_policy.knowledge_base_s3,
    aws_iam_role_policy.knowledge_base_model,
    aws_opensearchserverless_collection.knowledge_base
  ]
}

# OpenSearch Serverless Collection (minimal configuration for cost)
resource "aws_opensearchserverless_collection" "knowledge_base" {
  name = "${var.project_name}-kb-${var.environment}"
  type = "VECTORSEARCH"

  tags = {
    Name = "${var.project_name}-kb-${var.environment}"
  }
}

# OpenSearch Serverless Encryption Policy
resource "aws_opensearchserverless_security_policy" "knowledge_base_encryption" {
  name = "${var.project_name}-kb-encryption-${var.environment}"
  type = "encryption"
  policy = jsonencode({
    Rules = [
      {
        ResourceType = "collection"
        Resource = [
          "collection/${var.project_name}-kb-${var.environment}"
        ]
      }
    ],
    AWSOwnedKey = true
  })
}

# OpenSearch Serverless Network Policy
resource "aws_opensearchserverless_security_policy" "knowledge_base_network" {
  name = "${var.project_name}-kb-network-${var.environment}"
  type = "network"
  policy = jsonencode([
    {
      Rules = [
        {
          ResourceType = "collection"
          Resource = [
            "collection/${var.project_name}-kb-${var.environment}"
          ]
        }
      ],
      AllowFromPublic = true
    }
  ])
}

# OpenSearch Serverless Access Policy
resource "aws_opensearchserverless_access_policy" "knowledge_base" {
  name = "${var.project_name}-kb-access-${var.environment}"
  type = "data"
  policy = jsonencode([
    {
      Rules = [
        {
          ResourceType = "collection"
          Resource = [
            "collection/${var.project_name}-kb-${var.environment}"
          ]
          Permission = [
            "aoss:CreateCollectionItems",
            "aoss:DeleteCollectionItems",
            "aoss:UpdateCollectionItems",
            "aoss:DescribeCollectionItems"
          ]
        },
        {
          ResourceType = "index"
          Resource = [
            "index/${var.project_name}-kb-${var.environment}/*"
          ]
          Permission = [
            "aoss:CreateIndex",
            "aoss:DeleteIndex",
            "aoss:UpdateIndex",
            "aoss:DescribeIndex",
            "aoss:ReadDocument",
            "aoss:WriteDocument"
          ]
        }
      ],
      Principal = [
        aws_iam_role.knowledge_base.arn,
        data.aws_caller_identity.current.arn
      ]
    }
  ])
}

# Data Source for Knowledge Base
resource "aws_bedrockagent_data_source" "research_papers" {
  name              = "research-papers"
  knowledge_base_id = aws_bedrockagent_knowledge_base.research.id
  description       = "Research papers on eye-gazing and attention training"

  data_source_configuration {
    type = "S3"
    s3_configuration {
      bucket_arn = aws_s3_bucket.knowledge_base.arn
      inclusion_prefixes = [
        "papers/",
        "extracted/"
      ]
    }
  }

  vector_ingestion_configuration {
    chunking_configuration {
      chunking_strategy = "FIXED_SIZE"
      fixed_size_chunking_configuration {
        max_tokens         = 300
        overlap_percentage = 20
      }
    }
  }

  depends_on = [
    aws_bedrockagent_knowledge_base.research
  ]
}

# Note: After terraform apply, you need to sync the data source:
# aws bedrock-agent start-ingestion-job \
#   --knowledge-base-id <KB_ID> \
#   --data-source-id <DATA_SOURCE_ID>
