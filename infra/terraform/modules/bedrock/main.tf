# S3 bucket for Bedrock Knowledge Base
resource "aws_s3_bucket" "knowledge_base" {
  bucket = "${var.project_name}-bedrock-kb-${var.environment}"

  tags = {
    Name = "${var.project_name}-bedrock-kb-${var.environment}"
  }
}

resource "aws_s3_bucket_versioning" "knowledge_base" {
  bucket = aws_s3_bucket.knowledge_base.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "knowledge_base" {
  bucket = aws_s3_bucket.knowledge_base.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "knowledge_base" {
  bucket = aws_s3_bucket.knowledge_base.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Upload knowledge base files
resource "aws_s3_object" "benchmarks" {
  bucket       = aws_s3_bucket.knowledge_base.id
  key          = "benchmarks.json"
  source       = "${path.root}/../../backend/bedrock/knowledge-base/benchmarks.json"
  etag         = filemd5("${path.root}/../../backend/bedrock/knowledge-base/benchmarks.json")
  content_type = "application/json"
}

resource "aws_s3_object" "research_metadata" {
  bucket       = aws_s3_bucket.knowledge_base.id
  key          = "metadata/research-metadata.json"
  source       = "${path.root}/../../backend/bedrock/knowledge-base/research-metadata.json"
  etag         = filemd5("${path.root}/../../backend/bedrock/knowledge-base/research-metadata.json")
  content_type = "application/json"
}

# Create folder structure for research documents
resource "aws_s3_object" "papers_folder" {
  bucket       = aws_s3_bucket.knowledge_base.id
  key          = "papers/"
  content_type = "application/x-directory"
}

resource "aws_s3_object" "extracted_folder" {
  bucket       = aws_s3_bucket.knowledge_base.id
  key          = "extracted/"
  content_type = "application/x-directory"
}

resource "aws_s3_object" "metadata_folder" {
  bucket       = aws_s3_bucket.knowledge_base.id
  key          = "metadata/"
  content_type = "application/x-directory"
}

# IAM role for Bedrock Agent
resource "aws_iam_role" "bedrock_agent" {
  name = "${var.project_name}-bedrock-agent-role-${var.environment}"

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
          "aws:SourceArn" = "arn:aws:bedrock:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:agent/*"
        }
      }
    }]
  })
}

# Policy for Bedrock to invoke Lambda
resource "aws_iam_role_policy" "bedrock_lambda" {
  name = "${var.project_name}-bedrock-lambda-policy-${var.environment}"
  role = aws_iam_role.bedrock_agent.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "lambda:InvokeFunction"
      ]
      Resource = var.metrics_calculator_arn
    }]
  })
}

# Policy for Bedrock to access model
resource "aws_iam_role_policy" "bedrock_model" {
  name = "${var.project_name}-bedrock-model-policy-${var.environment}"
  role = aws_iam_role.bedrock_agent.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "bedrock:InvokeModel"
      ]
      Resource = "arn:aws:bedrock:${data.aws_region.current.name}::foundation-model/${var.model_id}"
    }]
  })
}

# Policy for Bedrock to access Knowledge Base
resource "aws_iam_role_policy" "bedrock_kb" {
  name = "${var.project_name}-bedrock-kb-policy-${var.environment}"
  role = aws_iam_role.bedrock_agent.id

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
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:Retrieve",
          "bedrock:RetrieveAndGenerate"
        ]
        Resource = "*"
      }
    ]
  })
}

# Bedrock Agent
resource "aws_bedrockagent_agent" "focusflow" {
  agent_name              = "${var.project_name}-agent-${var.environment}"
  agent_resource_role_arn = aws_iam_role.bedrock_agent.arn
  foundation_model        = var.model_id
  instruction             = file("${path.root}/../../backend/bedrock/prompts/analysis-prompt.txt")
  
  description = "AI agent for analyzing eye-tracking session data and generating therapeutic insights"

  idle_session_ttl_in_seconds = 600

  tags = {
    Name = "${var.project_name}-agent-${var.environment}"
  }
}

# Action Group for Metrics Calculator
resource "aws_bedrockagent_agent_action_group" "metrics_calculator" {
  agent_id      = aws_bedrockagent_agent.focusflow.id
  agent_version = "DRAFT"
  
  action_group_name = "MetricsCalculator"
  description       = "Calculate performance metrics from session data"
  
  action_group_executor {
    lambda = var.metrics_calculator_arn
  }

  api_schema {
    payload = jsonencode({
      openapi = "3.0.0"
      info = {
        title   = "Metrics Calculator API"
        version = "1.0.0"
        description = "API for calculating eye-tracking performance metrics"
      }
      paths = {
        "/calculate-metrics" = {
          post = {
            summary     = "Calculate metrics from session data"
            description = "Analyzes session data and returns performance metrics"
            operationId = "calculateMetrics"
            requestBody = {
              required = true
              content = {
                "application/json" = {
                  schema = {
                    type = "object"
                    properties = {
                      s3Key = {
                        type        = "string"
                        description = "S3 key path to session data"
                      }
                      bucketName = {
                        type        = "string"
                        description = "S3 bucket name"
                      }
                    }
                    required = ["s3Key", "bucketName"]
                  }
                }
              }
            }
            responses = {
              "200" = {
                description = "Metrics calculated successfully"
                content = {
                  "application/json" = {
                    schema = {
                      type = "object"
                      properties = {
                        level                  = { type = "string" }
                        duration               = { type = "number" }
                        trackingAccuracy       = { type = "number" }
                        timeOnTarget           = { type = "number" }
                        avgDistanceFromTarget  = { type = "number" }
                        focusScore             = { type = "number" }
                        totalDataPoints        = { type = "number" }
                        trackedDataPoints      = { type = "number" }
                        calculatedAt           = { type = "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  }
}

# Prepare the agent
resource "aws_bedrockagent_agent_alias" "focusflow" {
  agent_id         = aws_bedrockagent_agent.focusflow.id
  agent_alias_name = var.environment
  description      = "Alias for ${var.environment} environment"

  depends_on = [
    aws_bedrockagent_agent_action_group.metrics_calculator
  ]
}

# Lambda permission for Bedrock to invoke
resource "aws_lambda_permission" "bedrock_invoke" {
  statement_id  = "AllowBedrockInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.metrics_calculator_function_name
  principal     = "bedrock.amazonaws.com"
  source_arn    = aws_bedrockagent_agent.focusflow.agent_arn
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
