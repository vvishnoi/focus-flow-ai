# FocusFlow AI - Frontend Deployment Guide

Complete guide to deploy the Next.js PWA to AWS using S3 + CloudFront.

## 🏗️ Architecture

```
User Browser
    ↓ HTTPS
CloudFront CDN (Global Edge Locations)
    ↓
S3 Bucket (Static Files)
    - HTML, CSS, JavaScript
    - Images, Fonts
    - PWA Manifest
```

## ✨ Features

- **Global CDN**: CloudFront edge locations worldwide
- **HTTPS**: Automatic SSL/TLS
- **Caching**: Optimized cache policies
- **Compression**: Gzip/Brotli compression
- **SPA Routing**: Proper handling of client-side routes
- **PWA Support**: Service worker and manifest
- **Versioning**: S3 versioning enabled
- **Invalidation**: Automatic cache invalidation on deploy

## 📋 Prerequisites

1. **Infrastructure Deployed**
   ```bash
   cd infra/terraform
   terraform apply
   ```

2. **Node.js Installed**
   ```bash
   node --version  # Should be 18+
   ```

3. **AWS CLI Configured**
   ```bash
   aws configure list
   ```

## 🚀 Deployment Methods

### Method 1: Automated Script (Recommended)

```bash
./scripts/deploy-frontend.sh
```

This script will:
1. ✅ Check prerequisites
2. ✅ Get infrastructure details from Terraform
3. ✅ Configure environment variables
4. ✅ Install dependencies
5. ✅ Build Next.js application
6. ✅ Export static files
7. ✅ Upload to S3
8. ✅ Invalidate CloudFront cache
9. ✅ Display deployment URL

### Method 2: Manual Deployment

#### Step 1: Get Infrastructure Details

```bash
cd infra/terraform

# Get outputs
BUCKET_NAME=$(terraform output -raw frontend_bucket_name)
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
API_URL=$(terraform output -raw api_gateway_url)

echo "Bucket: $BUCKET_NAME"
echo "Distribution: $DISTRIBUTION_ID"
echo "API: $API_URL"
```

#### Step 2: Configure Environment

```bash
cd ../frontend

# Create production environment file
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=$API_URL
EOF
```

#### Step 3: Build Application

```bash
# Install dependencies
npm install

# Build for production (automatically exports to 'out' directory)
npm run build
```

#### Step 4: Upload to S3

```bash
# Upload static assets (with long cache)
aws s3 sync out/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# Upload HTML/JSON (with short cache)
aws s3 sync out/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html" \
  --include "*.json"
```

#### Step 5: Invalidate CloudFront

```bash
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

## 🔧 Configuration

### Cache Policies

**Static Assets** (`/_next/static/*`):
- Cache: 1 year (31536000 seconds)
- Immutable: Yes
- Compression: Yes

**HTML/JSON Files**:
- Cache: 0 seconds (always revalidate)
- Compression: Yes

**Default**:
- Cache: 1 hour (3600 seconds)
- Compression: Yes

### Environment Variables

Create `.env.production` in frontend directory:

```bash
# API Gateway URL
NEXT_PUBLIC_API_URL=https://xxx.execute-api.us-east-1.amazonaws.com/dev

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional: Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 📊 Monitoring

### CloudFront Metrics

Check AWS Console → CloudFront → Distributions → Metrics:
- Requests
- Bytes downloaded
- Error rate (4xx, 5xx)
- Cache hit ratio

### S3 Metrics

Check AWS Console → S3 → Bucket → Metrics:
- Storage size
- Number of objects
- Requests

### Cost Monitoring

```bash
# Check CloudFront costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '7 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost \
  --filter file://cloudfront-filter.json
```

## 💰 Cost Estimation

### Monthly Costs (10,000 users, 100,000 page views)

**CloudFront:**
- Data Transfer: ~$8.50 (100GB)
- Requests: ~$1.00 (1M requests)
- Invalidations: ~$0.50 (100 invalidations)

**S3:**
- Storage: ~$0.50 (20GB)
- Requests: ~$0.50 (100K requests)

**Total: ~$11/month**

### Free Tier Benefits
- CloudFront: 1TB data transfer, 10M requests/month (first 12 months)
- S3: 5GB storage, 20K GET requests/month (always free)

## 🔄 CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy-frontend.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy Frontend
        run: ./scripts/deploy-frontend.sh
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
deploy-frontend:
  stage: deploy
  image: node:18
  before_script:
    - apt-get update && apt-get install -y awscli
  script:
    - ./scripts/deploy-frontend.sh
  only:
    - main
  environment:
    name: production
```

## 🔐 Security

### Content Security Policy

Add to `frontend/app/layout.tsx`:

```typescript
export const metadata = {
  // ... existing metadata
  other: {
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://*.execute-api.us-east-1.amazonaws.com;
    `.replace(/\s+/g, ' ').trim()
  }
}
```

### HTTPS Only

CloudFront automatically redirects HTTP to HTTPS.

### CORS Configuration

Already configured in API Gateway module.

## 🐛 Troubleshooting

### Issue: 404 on Page Refresh

**Cause**: CloudFront not configured for SPA routing

**Solution**: Already handled with custom error responses in Terraform

### Issue: Old Content Showing

**Cause**: CloudFront cache not invalidated

**Solution**:
```bash
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

### Issue: Build Fails

**Cause**: Missing dependencies or environment variables

**Solution**:
```bash
cd frontend
rm -rf node_modules .next out
npm install
npm run build
```

### Issue: API Calls Failing

**Cause**: CORS or incorrect API URL

**Solution**:
1. Check `.env.production` has correct API URL
2. Verify CORS in API Gateway
3. Check browser console for errors

## 🔄 Rollback

### Rollback to Previous Version

```bash
# List S3 versions
aws s3api list-object-versions \
  --bucket $BUCKET_NAME \
  --prefix index.html

# Restore specific version
aws s3api copy-object \
  --bucket $BUCKET_NAME \
  --copy-source $BUCKET_NAME/index.html?versionId=VERSION_ID \
  --key index.html

# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

## 📈 Performance Optimization

### 1. Enable Compression

Already enabled in CloudFront configuration.

### 2. Optimize Images

```bash
# Install sharp for image optimization
cd frontend
npm install sharp
```

### 3. Code Splitting

Next.js automatically code-splits. Verify:
```bash
npm run build
# Check output for chunk sizes
```

### 4. Lazy Loading

Use dynamic imports:
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'))
```

## 🌐 Custom Domain (Optional)

### Step 1: Request SSL Certificate

```bash
# Request certificate in us-east-1 (required for CloudFront)
aws acm request-certificate \
  --domain-name focusflow.app \
  --subject-alternative-names www.focusflow.app \
  --validation-method DNS \
  --region us-east-1
```

### Step 2: Validate Certificate

Follow DNS validation instructions in AWS Console.

### Step 3: Update Terraform

```hcl
# In terraform.tfvars
domain_name = "focusflow.app"
acm_certificate_arn = "arn:aws:acm:us-east-1:xxx:certificate/xxx"
```

### Step 4: Update DNS

Point your domain to CloudFront:
```
focusflow.app    CNAME    d111111abcdef8.cloudfront.net
www.focusflow.app CNAME   d111111abcdef8.cloudfront.net
```

## 📝 Deployment Checklist

- [ ] Infrastructure deployed with Terraform
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Application builds successfully
- [ ] Static export works
- [ ] Files uploaded to S3
- [ ] CloudFront cache invalidated
- [ ] Application accessible via CloudFront URL
- [ ] API calls working
- [ ] PWA features working (manifest, service worker)
- [ ] HTTPS working
- [ ] All routes accessible
- [ ] Mobile responsive
- [ ] Performance tested

## 🎯 Next Steps

1. ✅ Deploy frontend to AWS
2. ⏳ Set up custom domain
3. ⏳ Configure CI/CD pipeline
4. ⏳ Add monitoring and alerts
5. ⏳ Set up error tracking (Sentry)
6. ⏳ Add analytics (Google Analytics)
7. ⏳ Performance monitoring (Web Vitals)

## 📚 Resources

- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [AWS CLI S3 Sync](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html)

---

**Your frontend is now production-ready on AWS! 🚀**
