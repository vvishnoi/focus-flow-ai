terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  # Uncomment for remote state
  # backend "s3" {
  #   bucket = "focusflow-terraform-state"
  #   key    = "terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "FocusFlow-AI"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# S3 bucket for session data
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}

# DynamoDB tables
module "dynamodb" {
  source = "./modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment
}

# Lambda functions
module "lambda" {
  source = "./modules/lambda"

  project_name            = var.project_name
  environment             = var.environment
  s3_bucket_name          = module.s3.bucket_name
  s3_bucket_arn           = module.s3.bucket_arn
  reports_table_name      = module.dynamodb.reports_table_name
  reports_table_arn       = module.dynamodb.reports_table_arn
  users_table_name        = module.dynamodb.users_table_name
  users_table_arn         = module.dynamodb.users_table_arn
  bedrock_agent_id        = module.bedrock.agent_id
  bedrock_agent_alias_id  = module.bedrock.agent_alias_id
}

# API Gateway
module "api_gateway" {
  source = "./modules/api-gateway"

  project_name              = var.project_name
  environment               = var.environment
  data_ingestor_invoke_arn  = module.lambda.data_ingestor_invoke_arn
  data_ingestor_function_name = module.lambda.data_ingestor_function_name
  get_reports_invoke_arn    = module.lambda.get_reports_invoke_arn
  get_reports_function_name = module.lambda.get_reports_function_name
  frontend_url              = var.frontend_url
}

# Bedrock Agent
module "bedrock" {
  source = "./modules/bedrock"

  project_name                    = var.project_name
  environment                     = var.environment
  model_id                        = var.bedrock_model_id
  metrics_calculator_arn          = module.lambda.metrics_calculator_arn
  metrics_calculator_function_name = module.lambda.metrics_calculator_function_name
}

# Frontend (S3 + CloudFront)
module "frontend" {
  source = "./modules/frontend"

  project_name = var.project_name
  environment  = var.environment
}
