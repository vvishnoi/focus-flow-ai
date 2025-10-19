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

variable "create_profile_invoke_arn" {
  description = "Create profile Lambda invoke ARN"
  type        = string
}

variable "create_profile_function_name" {
  description = "Create profile Lambda function name"
  type        = string
}

variable "get_profiles_invoke_arn" {
  description = "Get profiles Lambda invoke ARN"
  type        = string
}

variable "get_profiles_function_name" {
  description = "Get profiles Lambda function name"
  type        = string
}

variable "delete_profile_invoke_arn" {
  description = "Delete profile Lambda invoke ARN"
  type        = string
}

variable "delete_profile_function_name" {
  description = "Delete profile Lambda function name"
  type        = string
}
