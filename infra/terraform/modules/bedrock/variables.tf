variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "model_id" {
  description = "Bedrock foundation model ID"
  type        = string
  default     = "anthropic.claude-sonnet-4-5-20250929-v1:0"
}

variable "metrics_calculator_arn" {
  description = "Metrics calculator Lambda ARN"
  type        = string
}

variable "metrics_calculator_function_name" {
  description = "Metrics calculator Lambda function name"
  type        = string
}
