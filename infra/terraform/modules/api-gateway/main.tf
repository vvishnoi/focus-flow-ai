resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["content-type", "authorization", "x-requested-with"]
    expose_headers = ["*"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${var.project_name}-${var.environment}"
  retention_in_days = 7
}

# Lambda integration for data ingestor
resource "aws_apigatewayv2_integration" "data_ingestor" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"

  integration_uri    = var.data_ingestor_invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "submit_session" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /submit-session"
  target    = "integrations/${aws_apigatewayv2_integration.data_ingestor.id}"
}

resource "aws_lambda_permission" "data_ingestor" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.data_ingestor_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Lambda integration for get reports
resource "aws_apigatewayv2_integration" "get_reports" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"

  integration_uri    = var.get_reports_invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_reports" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /reports/{userId}"
  target    = "integrations/${aws_apigatewayv2_integration.get_reports.id}"
}

resource "aws_lambda_permission" "get_reports" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.get_reports_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Lambda integration for create profile
resource "aws_apigatewayv2_integration" "create_profile" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"

  integration_uri    = var.create_profile_invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "create_profile" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /profiles"
  target    = "integrations/${aws_apigatewayv2_integration.create_profile.id}"
}

resource "aws_lambda_permission" "create_profile" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.create_profile_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Lambda integration for get profiles
resource "aws_apigatewayv2_integration" "get_profiles" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"

  integration_uri    = var.get_profiles_invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_profiles" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /profiles/{therapistId}"
  target    = "integrations/${aws_apigatewayv2_integration.get_profiles.id}"
}

resource "aws_lambda_permission" "get_profiles" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.get_profiles_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Lambda integration for delete profile
resource "aws_apigatewayv2_integration" "delete_profile" {
  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"

  integration_uri    = var.delete_profile_invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "delete_profile" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /profiles/{therapistId}/{profileId}"
  target    = "integrations/${aws_apigatewayv2_integration.delete_profile.id}"
}

resource "aws_lambda_permission" "delete_profile" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.delete_profile_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
