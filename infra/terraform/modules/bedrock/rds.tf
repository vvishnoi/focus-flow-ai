# PostgreSQL RDS instance for Bedrock Knowledge Base vector storage
# Cost: ~$20-30/month for db.t3.micro

resource "aws_db_subnet_group" "kb_postgres" {
  name       = "${var.project_name}-kb-postgres-${var.environment}"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "${var.project_name}-kb-postgres-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_security_group" "kb_postgres" {
  name        = "${var.project_name}-kb-postgres-${var.environment}"
  description = "Security group for Knowledge Base PostgreSQL RDS"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "PostgreSQL access from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-kb-postgres-${var.environment}"
    Environment = var.environment
  }
}

# Random password for RDS
resource "random_password" "kb_postgres" {
  length  = 32
  special = true
}

# Store password in Secrets Manager
resource "aws_secretsmanager_secret" "kb_postgres" {
  name        = "${var.project_name}-kb-postgres-${var.environment}"
  description = "PostgreSQL credentials for Bedrock Knowledge Base"

  tags = {
    Name        = "${var.project_name}-kb-postgres-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "kb_postgres" {
  secret_id = aws_secretsmanager_secret.kb_postgres.id
  secret_string = jsonencode({
    username = "kbadmin"
    password = random_password.kb_postgres.result
    engine   = "postgres"
    host     = aws_db_instance.kb_postgres.address
    port     = 5432
    dbname   = "knowledge_base"
  })
}

# PostgreSQL RDS instance with pgvector support
resource "aws_db_instance" "kb_postgres" {
  identifier     = "${var.project_name}-kb-postgres-${var.environment}"
  engine         = "postgres"
  engine_version = "15.8" # Supports pgvector extension
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "knowledge_base"
  username = "kbadmin"
  password = random_password.kb_postgres.result

  db_subnet_group_name   = aws_db_subnet_group.kb_postgres.name
  vpc_security_group_ids = [aws_security_group.kb_postgres.id]

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${var.project_name}-kb-postgres-final-${var.environment}" : null

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Name        = "${var.project_name}-kb-postgres-${var.environment}"
    Environment = var.environment
  }
}

# Update IAM role policy to allow RDS access
resource "aws_iam_role_policy" "kb_rds_policy" {
  name = "${var.project_name}-kb-rds-policy-${var.environment}"
  role = aws_iam_role.knowledge_base.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "rds-data:ExecuteStatement",
          "rds-data:BatchExecuteStatement"
        ]
        Resource = aws_db_instance.kb_postgres.arn
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.kb_postgres.arn
      }
    ]
  })
}
