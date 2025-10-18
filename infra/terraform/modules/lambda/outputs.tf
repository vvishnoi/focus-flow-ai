output "data_ingestor_function_name" {
  description = "Data ingestor function name"
  value       = aws_lambda_function.data_ingestor.function_name
}

output "data_ingestor_invoke_arn" {
  description = "Data ingestor invoke ARN"
  value       = aws_lambda_function.data_ingestor.invoke_arn
}

output "metrics_calculator_function_name" {
  description = "Metrics calculator function name"
  value       = aws_lambda_function.metrics_calculator.function_name
}

output "metrics_calculator_arn" {
  description = "Metrics calculator ARN"
  value       = aws_lambda_function.metrics_calculator.arn
}

output "get_reports_function_name" {
  description = "Get reports function name"
  value       = aws_lambda_function.get_reports.function_name
}

output "get_reports_invoke_arn" {
  description = "Get reports invoke ARN"
  value       = aws_lambda_function.get_reports.invoke_arn
}

output "analysis_trigger_function_name" {
  description = "Analysis trigger function name"
  value       = aws_lambda_function.analysis_trigger.function_name
}

output "create_profile_function_name" {
  description = "Create profile function name"
  value       = aws_lambda_function.create_profile.function_name
}

output "create_profile_invoke_arn" {
  description = "Create profile invoke ARN"
  value       = aws_lambda_function.create_profile.invoke_arn
}

output "get_profiles_function_name" {
  description = "Get profiles function name"
  value       = aws_lambda_function.get_profiles.function_name
}

output "get_profiles_invoke_arn" {
  description = "Get profiles invoke ARN"
  value       = aws_lambda_function.get_profiles.invoke_arn
}

output "delete_profile_function_name" {
  description = "Delete profile function name"
  value       = aws_lambda_function.delete_profile.function_name
}

output "delete_profile_invoke_arn" {
  description = "Delete profile invoke ARN"
  value       = aws_lambda_function.delete_profile.invoke_arn
}
