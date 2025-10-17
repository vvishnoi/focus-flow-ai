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
