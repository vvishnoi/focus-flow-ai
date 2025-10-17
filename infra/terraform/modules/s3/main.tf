resource "aws_s3_bucket" "sessions" {
  bucket = "${var.project_name}-sessions-${var.environment}"

  tags = {
    Name = "${var.project_name}-sessions-${var.environment}"
  }
}

resource "aws_s3_bucket_versioning" "sessions" {
  bucket = aws_s3_bucket.sessions.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "sessions" {
  bucket = aws_s3_bucket.sessions.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "sessions" {
  bucket = aws_s3_bucket.sessions.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "sessions" {
  bucket = aws_s3_bucket.sessions.id

  rule {
    id     = "archive-old-sessions"
    status = "Enabled"

    filter {
      prefix = "sessions/"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 365
    }
  }
}
