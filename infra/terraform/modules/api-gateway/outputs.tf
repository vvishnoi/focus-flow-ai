output "api_url" {
  description = "API Gateway URL"
  value       = aws_apigatewayv2_stage.main.invoke_url
}

output "api_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.main.id
}
