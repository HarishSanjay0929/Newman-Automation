# Getting Started Guide

## Prerequisites
- Node.js 18+ installed
- Git repository access
- Gmail account for email notifications
- Postman collection and environment files

## Step 1: Clone and Install

```bash
# Clone your repository
git clone <your-repository-url>
cd newman-automation-enhanced

# Install dependencies
npm install
```

## Step 2: Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your credentials:**
   ```env
   # Email Configuration (Required)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_TO=recipient@company.com
   
   # Optional: Additional recipients
   EMAIL_CC=manager@company.com
   EMAIL_BCC=archive@company.com
   
   # Optional: Slack Integration
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
   SLACK_CHANNEL=#api-testing
   
   # Optional: Teams Integration
   TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR/TEAMS/WEBHOOK
   
   # Environment
   NODE_ENV=production
   ```

## Step 3: Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

## Step 4: Validate Setup

```bash
# Check if everything is configured correctly
npm run validate
```

This will check:
- ✅ Environment variables
- ✅ Required files
- ✅ Directory permissions
- ✅ Dependencies

## Step 5: Test Run

```bash
# Run your first test
npm test
```

Expected output:
```
🚀 Starting Enhanced Newman Test Suite...
📁 Created directory: reports
📁 Created directory: data
🧪 Running Newman tests...
✅ Newman tests completed successfully
📄 Enhanced report saved: reports/enhanced-report.html
📧 Enhanced email report sent successfully
✅ Enhanced Newman test suite completed successfully!
```

## Step 6: Review Results

Check the generated files:
- `reports/enhanced-report.html` - Rich HTML report with trends
- `reports/report.html` - Standard Newman report
- `data/test-history.json` - Historical test data
- Email inbox - Detailed email report

## Common Issues and Solutions

### Issue: "Missing environment variable: EMAIL_USER"
**Solution:** Ensure your `.env` file exists and contains all required variables

### Issue: "Email sending failed"
**Solution:** 
- Verify Gmail app password is correct
- Check if 2FA is enabled on Gmail account
- Ensure EMAIL_USER format is correct

### Issue: "Newman collection file not found"
**Solution:** Ensure `Collection.json` exists in the root directory

### Issue: "Permission denied" errors
**Solution:** Check directory permissions for `reports/` and `data/` folders
