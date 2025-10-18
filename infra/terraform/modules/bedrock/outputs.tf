output "agent_id" {
  description = "Bedrock Agent ID"
  value       = aws_bedrockagent_agent.focusflow.id
}

output "agent_arn" {
  description = "Bedrock Agent ARN"
  value       = aws_bedrockagent_agent.focusflow.agent_arn
}

output "agent_alias_id" {
  description = "Bedrock Agent Alias ID"
  value       = aws_bedrockagent_agent_alias.focusflow.agent_alias_id
}

output "agent_alias_arn" {
  description = "Bedrock Agent Alias ARN"
  value       = aws_bedrockagent_agent_alias.focusflow.agent_alias_arn
}

output "knowledge_base_bucket" {
  description = "Knowledge Base S3 bucket name"
  value       = aws_s3_bucket.knowledge_base.id
}

output "knowledge_base_role_arn" {
  description = "Knowledge Base IAM role ARN"
  value       = aws_iam_role.knowledge_base.arn
}

output "knowledge_base_role_name" {
  description = "Knowledge Base IAM role name"
  value       = aws_iam_role.knowledge_base.name
}

output "knowledge_base_id" {
  description = "Bedrock Knowledge Base ID"
  value       = try(aws_bedrockagent_knowledge_base.research.id, "")
}

output "knowledge_base_arn" {
  description = "Bedrock Knowledge Base ARN"
  value       = try(aws_bedrockagent_knowledge_base.research.knowledge_base_arn, "")
}

output "data_source_id" {
  description = "Knowledge Base Data Source ID"
  value       = try(aws_bedrockagent_data_source.research_papers.data_source_id, "")
}

output "opensearch_collection_endpoint" {
  description = "OpenSearch Serverless collection endpoint"
  value       = try(aws_opensearchserverless_collection.knowledge_base.collection_endpoint, "")
}
