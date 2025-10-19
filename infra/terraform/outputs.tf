output "api_gateway_url" {
  description = "API Gateway endpoint URL"
  value       = module.api_gateway.api_url
}

output "s3_bucket_name" {
  description = "S3 bucket name for session data"
  value       = module.s3.bucket_name
}

output "reports_table_name" {
  description = "DynamoDB reports table name"
  value       = module.dynamodb.reports_table_name
}

output "users_table_name" {
  description = "DynamoDB users table name"
  value       = module.dynamodb.users_table_name
}

output "data_ingestor_function_name" {
  description = "Data ingestor Lambda function name"
  value       = module.lambda.data_ingestor_function_name
}

output "metrics_calculator_function_name" {
  description = "Metrics calculator Lambda function name"
  value       = module.lambda.metrics_calculator_function_name
}

output "bedrock_agent_id" {
  description = "Bedrock Agent ID"
  value       = module.bedrock.agent_id
}

output "bedrock_agent_alias_id" {
  description = "Bedrock Agent Alias ID"
  value       = module.bedrock.agent_alias_id
}

output "knowledge_base_bucket" {
  description = "Knowledge Base S3 bucket name"
  value       = module.bedrock.knowledge_base_bucket
}

output "bedrock_kb_bucket_name" {
  description = "Bedrock Knowledge Base S3 bucket name (alias)"
  value       = module.bedrock.knowledge_base_bucket
}

output "knowledge_base_id" {
  description = "Bedrock Knowledge Base ID"
  value       = module.bedrock.knowledge_base_id
}

output "knowledge_base_arn" {
  description = "Bedrock Knowledge Base ARN"
  value       = module.bedrock.knowledge_base_arn
}

output "data_source_id" {
  description = "Knowledge Base Data Source ID"
  value       = module.bedrock.data_source_id
}

output "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  value       = module.frontend.bucket_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.frontend.cloudfront_distribution_id
}

output "cloudfront_url" {
  description = "CloudFront URL for frontend"
  value       = module.frontend.cloudfront_url
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = module.frontend.cloudfront_url
}


output "profiles_table_name" {
  description = "DynamoDB profiles table name"
  value       = module.dynamodb.profiles_table_name
}
