variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "data_ingestor_invoke_arn" {
  description = "Data ingestor Lambda invoke ARN"
  type        = string
}

variable "data_ingestor_function_name" {
  description = "Data ingestor Lambda function name"
  type        = string
}

variable "get_reports_invoke_arn" {
  description = "Get reports Lambda invoke ARN"
  type        = string
}

variable "get_reports_function_name" {
  description = "Get reports Lambda function name"
  type        = string
}

variable "frontend_url" {
  description = "Frontend URL for CORS"
  type        = string
}
