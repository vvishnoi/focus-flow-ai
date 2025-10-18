output "reports_table_name" {
  description = "Reports table name"
  value       = aws_dynamodb_table.reports.name
}

output "reports_table_arn" {
  description = "Reports table ARN"
  value       = aws_dynamodb_table.reports.arn
}

output "users_table_name" {
  description = "Users table name"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "Users table ARN"
  value       = aws_dynamodb_table.users.arn
}

output "profiles_table_name" {
  description = "Profiles table name"
  value       = aws_dynamodb_table.profiles.name
}

output "profiles_table_arn" {
  description = "Profiles table ARN"
  value       = aws_dynamodb_table.profiles.arn
}
