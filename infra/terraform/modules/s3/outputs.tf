output "bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.sessions.id
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.sessions.arn
}
