# Troubleshooting Guide

Common issues and solutions for FocusFlow AI.

## Table of Contents

- [Frontend Issues](#frontend-issues)
- [Backend Issues](#backend-issues)
- [Deployment Issues](#deployment-issues)
- [AI Report Issues](#ai-report-issues)
- [Infrastructure Issues](#infrastructure-issues)

---

## Frontend Issues

### Issue: Frontend Shows "Access Denied"

**Symptoms:**
- CloudFront URL returns XML error
- Message: "Access Denied"

**Cause:**
- Using wrong CloudFront distribution URL
- S3 bucket policy restricts access

**Solution:**
```bash
# Use the correct CloudFront URL
https://d3sy81kn37rion.cloudfront.net/

# NOT the old one:
# https://d3oqpd4mab1ra9.cloudfront.net/
```

---

### Issue: Eye Tracker Not Working

**Symptoms:**
- Calibration fails
- No gaze points detected

**Causes & Solutions:**

1. **Camera Permission Denied**
   - Grant camera access in browser settings
   - Reload the page

2. **Poor Lighting**
   - Ensure good lighting on face
   - Avoid backlighting

3. **Browser Compatibility**
   - Use Chrome or Edge (recommended)
   - Firefox and Safari have limited support

4. **WebGazer Not Loading**
   ```javascript
   // Check console for errors
   console.log(window.webgazer)
   ```

---

### Issue: Game Not Loading

**Symptoms:**
- Blank screen
- Loading spinner forever

**Solution:**
```bash
# Check browser console for errors
# Common issues:
# 1. API URL not configured
# 2. CORS errors
# 3. JavaScript errors

# Verify API URL in .env.local
NEXT_PUBLIC_API_URL=https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev
```

---

### Issue: Scorecard Not Showing

**Symptoms:**
- Game completes but no scorecard
- Console errors

**Solution:**
```javascript
// Check localStorage
localStorage.getItem('focusflow_session_history')

// Clear if corrupted
localStorage.removeItem('focusflow_session_history')
```

---

## Backend Issues

### Issue: API Returns 500 Error

**Symptoms:**
- All API calls return 500
- "Internal Server Error" message

**Diagnosis:**
```bash
# Check Lambda logs
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --since 10m

# Look for error messages
```

**Common Causes:**

1. **Lambda Permission Issues**
   ```bash
   # Check Lambda can access DynamoDB
   aws iam get-role-policy \
     --role-name focusflow-lambda-role-dev \
     --policy-name focusflow-lambda-dynamodb-policy-dev
   ```

2. **Environment Variables Missing**
   ```bash
   # Check Lambda environment variables
   aws lambda get-function-configuration \
     --function-name focusflow-data-ingestor-dev \
     --query 'Environment'
   ```

3. **DynamoDB Table Not Found**
   ```bash
   # Verify tables exist
   aws dynamodb list-tables | grep focusflow
   ```

---

### Issue: API Returns 404 Error

**Symptoms:**
- Specific endpoints return 404
- "Not Found" message

**Diagnosis:**
```bash
# Check API Gateway routes
aws apigatewayv2 get-routes --api-id oiks1jrjw2
```

**Solution:**
```bash
# Verify route exists
# If missing, redeploy infrastructure
cd infra/terraform
terraform apply -target=module.api_gateway
```

---

### Issue: Lambda Timeout

**Symptoms:**
- Request takes >30 seconds
- Gateway timeout error

**Solution:**
```bash
# Increase Lambda timeout
aws lambda update-function-configuration \
  --function-name focusflow-analysis-trigger-dev \
  --timeout 300
```

---

## Deployment Issues

### Issue: Terraform State Lock

**Symptoms:**
- `terraform apply` fails
- "Error locking state" message

**Solution:**
```bash
# List locks
terraform force-unlock <lock-id>

# Or wait 15 minutes for auto-unlock
```

---

### Issue: Lambda Deployment Fails

**Symptoms:**
- `terraform apply` fails on Lambda
- "InvalidParameterValueException"

**Diagnosis:**
```bash
# Check Lambda package size
ls -lh backend/functions/*.zip

# Max size: 50MB (zipped), 250MB (unzipped)
```

**Solution:**
```bash
# Remove node_modules before zipping
cd backend/functions/data-ingestor
rm -rf node_modules
npm install --production
zip -r ../data-ingestor.zip .
```

---

### Issue: CloudFront Not Updating

**Symptoms:**
- Frontend changes not visible
- Old version still showing

**Solution:**
```bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1CP1219GKD5ZW \
  --paths "/*"

# Wait 5-10 minutes for propagation
```

---

## AI Report Issues

### Issue: Reports Not Generating

**Symptoms:**
- Dashboard shows "No reports yet"
- Session submitted but no report after 60 seconds

**Diagnosis:**
```bash
# Check analysis-trigger Lambda logs
aws logs tail /aws/lambda/focusflow-analysis-trigger-dev --since 5m
```

**Common Causes:**

1. **Bedrock Permission Missing**
   ```bash
   # Check IAM policy
   aws iam get-role-policy \
     --role-name focusflow-lambda-role-dev \
     --policy-name focusflow-lambda-bedrock-policy-dev
   
   # Should include: bedrock:InvokeModel
   ```

   **Fix:**
   ```bash
   aws iam put-role-policy \
     --role-name focusflow-lambda-role-dev \
     --policy-name focusflow-lambda-bedrock-policy-dev \
     --policy-document '{
       "Version": "2012-10-17",
       "Statement": [{
         "Effect": "Allow",
         "Action": ["bedrock:InvokeAgent", "bedrock:InvokeModel"],
         "Resource": "*"
       }]
     }'
   ```

2. **S3 Trigger Not Configured**
   ```bash
   # Check S3 notification
   aws s3api get-bucket-notification-configuration \
     --bucket focusflow-sessions-dev
   ```

3. **Bedrock Agent Not Deployed**
   ```bash
   # Check Bedrock Agent status
   aws bedrock-agent list-agents
   ```

---

### Issue: Reports Show for Wrong User

**Symptoms:**
- Played game but reports don't show
- Reports appear on different device

**Cause:**
- Each browser/device has unique userId in localStorage
- Reports are tied to userId

**Solution:**
```javascript
// Check your userId
console.log(localStorage.getItem('focusflow_user_id'))

// To see reports from another device, set that userId:
localStorage.setItem('focusflow_user_id', 'user_1760587506861_11qrr5vle')
location.reload()
```

---

### Issue: AI Report Takes Too Long

**Symptoms:**
- Report generation >2 minutes
- Lambda timeout

**Diagnosis:**
```bash
# Check Lambda duration
aws logs filter-pattern /aws/lambda/focusflow-analysis-trigger-dev \
  --filter-pattern "REPORT" \
  --since 1h
```

**Solution:**
- Bedrock calls typically take 20-30 seconds
- If >60 seconds, check Bedrock service status
- Consider increasing Lambda timeout to 300 seconds

---

## Infrastructure Issues

### Issue: DynamoDB Throttling

**Symptoms:**
- "ProvisionedThroughputExceededException"
- Slow API responses

**Solution:**
```bash
# Check table metrics
aws dynamodb describe-table --table-name focusflow-reports-dev

# Tables use on-demand billing, should auto-scale
# If issues persist, check for hot partitions
```

---

### Issue: S3 Bucket Access Denied

**Symptoms:**
- Lambda can't write to S3
- "Access Denied" in logs

**Solution:**
```bash
# Check Lambda role has S3 permissions
aws iam get-role-policy \
  --role-name focusflow-lambda-role-dev \
  --policy-name focusflow-lambda-s3-policy-dev

# Should include: s3:PutObject, s3:GetObject
```

---

### Issue: API Gateway CORS Errors

**Symptoms:**
- Browser console shows CORS error
- "No 'Access-Control-Allow-Origin' header"

**Solution:**
```bash
# Verify CORS configuration
aws apigatewayv2 get-api --api-id oiks1jrjw2 \
  --query 'CorsConfiguration'

# Should allow all origins (*)
```

---

## Monitoring & Debugging

### Check System Health

```bash
# Run health check script
./scripts/test-api-endpoints.sh

# Expected output:
# ✅ GET /reports - Status: 200
# ✅ POST /submit-session - Status: 200
# ✅ GET /profiles - Status: 200
```

### View Logs

```bash
# API Gateway logs
aws logs tail /aws/apigateway/focusflow-dev --follow

# Lambda logs (all functions)
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow
aws logs tail /aws/lambda/focusflow-get-reports-dev --follow
aws logs tail /aws/lambda/focusflow-analysis-trigger-dev --follow
```

### Check AWS Resources

```bash
# List all Lambda functions
aws lambda list-functions --query "Functions[?contains(FunctionName, 'focusflow')]"

# List DynamoDB tables
aws dynamodb list-tables | grep focusflow

# List S3 buckets
aws s3 ls | grep focusflow

# Check API Gateway
aws apigatewayv2 get-apis --query "Items[?contains(Name, 'focusflow')]"
```

---

## Getting Help

If you can't resolve the issue:

1. **Check Logs First**
   ```bash
   aws logs tail /aws/lambda/<function-name> --since 1h
   ```

2. **Verify Configuration**
   ```bash
   terraform state show module.<resource>
   ```

3. **Test Manually**
   ```bash
   # Test Lambda directly
   aws lambda invoke \
     --function-name focusflow-data-ingestor-dev \
     --payload file://test-payload.json \
     response.json
   ```

4. **Create GitHub Issue**
   - Include error messages
   - Include relevant logs
   - Describe steps to reproduce

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `AccessDeniedException` | Missing IAM permissions | Add required permissions to Lambda role |
| `ResourceNotFoundException` | DynamoDB table not found | Create table via Terraform |
| `InvalidParameterValueException` | Invalid Lambda configuration | Check environment variables |
| `TooManyRequestsException` | Rate limiting | Implement exponential backoff |
| `ServiceUnavailableException` | AWS service issue | Check AWS status page |

---

## Prevention Tips

1. **Always test locally first**
2. **Use Terraform for all infrastructure**
3. **Monitor CloudWatch logs regularly**
4. **Set up CloudWatch alarms**
5. **Keep documentation updated**
6. **Version control everything**
7. **Test deployments in dev first**
8. **Have rollback plan ready**
