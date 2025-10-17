variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "focusflow"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "frontend_url" {
  description = "Frontend URL for CORS configuration"
  type        = string
  default     = "http://localhost:3000"
}

variable "bedrock_model_id" {
  description = "Bedrock foundation model ID"
  type        = string
  default     = "anthropic.claude-sonnet-4-5-20250929-v1:0"
}
