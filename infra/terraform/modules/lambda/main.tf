# IAM role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Policy for S3 access
resource "aws_iam_role_policy" "lambda_s3" {
  name = "${var.project_name}-lambda-s3-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject"
      ]
      Resource = "${var.s3_bucket_arn}/*"
    }]
  })
}

# Policy for DynamoDB access
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.project_name}-lambda-dynamodb-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ]
      Resource = [
        var.reports_table_arn,
        "${var.reports_table_arn}/index/*",
        var.users_table_arn
      ]
    }]
  })
}

# Data Ingestor Lambda
data "archive_file" "data_ingestor" {
  type        = "zip"
  source_dir  = "${path.root}/../../backend/functions/data-ingestor"
  output_path = "${path.root}/../../backend/functions/data-ingestor.zip"
}

resource "aws_lambda_function" "data_ingestor" {
  filename         = data.archive_file.data_ingestor.output_path
  function_name    = "${var.project_name}-data-ingestor-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.data_ingestor.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      S3_BUCKET_NAME    = var.s3_bucket_name
      USERS_TABLE_NAME  = var.users_table_name
    }
  }
}

# Metrics Calculator Lambda
data "archive_file" "metrics_calculator" {
  type        = "zip"
  source_dir  = "${path.root}/../../backend/functions/metrics-calculator"
  output_path = "${path.root}/../../backend/functions/metrics-calculator.zip"
}

resource "aws_lambda_function" "metrics_calculator" {
  filename         = data.archive_file.metrics_calculator.output_path
  function_name    = "${var.project_name}-metrics-calculator-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.metrics_calculator.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 60
  memory_size     = 512

  environment {
    variables = {
      S3_BUCKET_NAME = var.s3_bucket_name
    }
  }
}

# Get Reports Lambda
data "archive_file" "get_reports" {
  type        = "zip"
  source_dir  = "${path.root}/../../backend/functions/get-reports"
  output_path = "${path.root}/../../backend/functions/get-reports.zip"
}

resource "aws_lambda_function" "get_reports" {
  filename         = data.archive_file.get_reports.output_path
  function_name    = "${var.project_name}-get-reports-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.get_reports.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      REPORTS_TABLE_NAME = var.reports_table_name
    }
  }
}

# Analysis Trigger Lambda
data "archive_file" "analysis_trigger" {
  type        = "zip"
  source_dir  = "${path.root}/../../backend/functions/analysis-trigger"
  output_path = "${path.root}/../../backend/functions/analysis-trigger.zip"
}

resource "aws_lambda_function" "analysis_trigger" {
  filename         = data.archive_file.analysis_trigger.output_path
  function_name    = "${var.project_name}-analysis-trigger-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.analysis_trigger.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 300  # 5 minutes for Bedrock processing
  memory_size     = 512

  environment {
    variables = {
      BEDROCK_AGENT_ID       = var.bedrock_agent_id
      BEDROCK_AGENT_ALIAS_ID = var.bedrock_agent_alias_id
      REPORTS_TABLE_NAME     = var.reports_table_name
    }
  }
}

# S3 trigger for analysis
resource "aws_s3_bucket_notification" "session_upload" {
  bucket = var.s3_bucket_name

  lambda_function {
    lambda_function_arn = aws_lambda_function.analysis_trigger.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "sessions/"
    filter_suffix       = ".json"
  }

  depends_on = [aws_lambda_permission.s3_invoke]
}

resource "aws_lambda_permission" "s3_invoke" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.analysis_trigger.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.s3_bucket_arn
}

# Policy for Bedrock Agent invocation
resource "aws_iam_role_policy" "lambda_bedrock" {
  name = "${var.project_name}-lambda-bedrock-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "bedrock:InvokeAgent"
      ]
      Resource = "*"
    }]
  })
}

# Create Profile Lambda
data "archive_file" "create_profile" {
  type        = "zip"
  source_dir  = "${path.root}/../../backend/functions/create-profile"
  output_path = "${path.root}/../../backend/functions/create-profile.zip"
}

resource "aws_lambda_function" "create_profile" {
  filename         = data.archive_file.create_profile.output_path
  function_name    = "${var.project_name}-create-profile-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.create_profile.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10
  memory_size     = 256

  environment {
    variables = {
      PROFILES_TABLE_NAME = var.profiles_table_name
    }
  }
}

resource "aws_cloudwatch_log_group" "create_profile" {
  name              = "/aws/lambda/${aws_lambda_function.create_profile.function_name}"
  retention_in_days = 7
}

# Get Profiles Lambda
data "archive_file" "get_profiles" {
  type        = "zip"
  source_dir  = "${path.root}/../../backend/functions/get-profiles"
  output_path = "${path.root}/../../backend/functions/get-profiles.zip"
}

resource "aws_lambda_function" "get_profiles" {
  filename         = data.archive_file.get_profiles.output_path
  function_name    = "${var.project_name}-get-profiles-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.get_profiles.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10
  memory_size     = 256

  environment {
    variables = {
      PROFILES_TABLE_NAME = var.profiles_table_name
    }
  }
}

resource "aws_cloudwatch_log_group" "get_profiles" {
  name              = "/aws/lambda/${aws_lambda_function.get_profiles.function_name}"
  retention_in_days = 7
}

# Delete Profile Lambda
data "archive_file" "delete_profile" {
  type        = "zip"
  source_dir  = "${path.root}/../../backend/functions/delete-profile"
  output_path = "${path.root}/../../backend/functions/delete-profile.zip"
}

resource "aws_lambda_function" "delete_profile" {
  filename         = data.archive_file.delete_profile.output_path
  function_name    = "${var.project_name}-delete-profile-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.delete_profile.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10
  memory_size     = 256

  environment {
    variables = {
      PROFILES_TABLE_NAME = var.profiles_table_name
    }
  }
}

resource "aws_cloudwatch_log_group" "delete_profile" {
  name              = "/aws/lambda/${aws_lambda_function.delete_profile.function_name}"
  retention_in_days = 7
}

# Update DynamoDB policy to include profiles table
resource "aws_iam_role_policy" "lambda_profiles_dynamodb" {
  name = "${var.project_name}-lambda-profiles-dynamodb-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:DeleteItem"
      ]
      Resource = [
        var.profiles_table_arn,
        "${var.profiles_table_arn}/index/*"
      ]
    }]
  })
}
