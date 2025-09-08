# GitHub Actions Scheduling Guide

## 🚀 Setting Up Automated Testing with GitHub Actions

### Step 1: Understanding the Workflow File

The workflow is located at `.github/workflows/run-newman.yml`:

```yaml
name: Enhanced Newman API Tests

on:
  workflow_dispatch:  # Manual trigger
  schedule:
   - cron: '30 0 * * *'  # Daily at 10:30 AM IST
  push:
    branches: [ main ]
    paths: 
      - 'Collection.json'
      - 'Environment.json'
      - 'enhanced-runner.js'
      - 'lib/**'
      - 'config/**'

jobs:
  run-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - name: ⬇️ Checkout Code
        uses: actions/checkout@v4
        
      - name: 🟢 Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: 📦 Install Dependencies
        run: npm ci
        
      - name: 🧪 Run Enhanced Newman Tests
        env:
          EMAIL_USER: ${{ secrets.EMAIL_USER }}
          EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}
          EMAIL_CC: ${{ secrets.EMAIL_CC }}
          EMAIL_BCC: ${{ secrets.EMAIL_BCC }}
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_CHANNEL: ${{ secrets.SLACK_CHANNEL }}
          TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
          NODE_ENV: production
        run: npm test
        
      - name: 📊 Upload Test Reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: newman-test-reports-${{ github.run_number }}
          path: |
            reports/
            data/
          retention-days: 30
```

### Step 2: Configure GitHub Secrets

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click on "Settings" tab
   - Select "Secrets and variables" → "Actions"

2. **Add Required Secrets**
   Click "New repository secret" for each:

   **Required Secrets:**
   ```
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASS = your-gmail-app-password
   EMAIL_TO = recipient@company.com
   ```

   **Optional Secrets:**
   ```
   EMAIL_CC = manager@company.com
   EMAIL_BCC = archive@company.com
   SLACK_WEBHOOK_URL = https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
   SLACK_CHANNEL = #api-testing
   TEAMS_WEBHOOK_URL = https://outlook.office.com/webhook/YOUR/TEAMS/WEBHOOK
   ```

### Step 3: Customize Schedule

The cron expression `'30 0 * * *'` means:
- `30` - 30th minute
- `0` - 0th hour (midnight UTC)
- `*` - Every day of month
- `*` - Every month
- `*` - Every day of week

**Common Schedule Examples:**

```yaml
# Daily at 9:00 AM UTC (2:30 PM IST)
- cron: '0 9 * * *'

# Twice daily at 6 AM and 6 PM UTC
- cron: '0 6,18 * * *'

# Every weekday at 8 AM UTC
- cron: '0 8 * * 1-5'

# Every Monday at 10 AM UTC
- cron: '0 10 * * 1'

# Every hour during business hours (9 AM - 5 PM UTC)
- cron: '0 9-17 * * 1-5'

# Every 15 minutes during business hours
- cron: '*/15 9-17 * * 1-5'
```

**Time Zone Considerations:**
- GitHub Actions uses UTC time
- IST = UTC + 5:30
- To run at 10:30 AM IST, use `'0 5 * * *'` (5:00 AM UTC)

### Step 4: Trigger Conditions

**Current Triggers:**
1. **Manual Trigger** (`workflow_dispatch`) - Run anytime from GitHub UI
2. **Scheduled** (`schedule`) - Automatic daily execution
3. **Code Changes** (`push`) - When specific files are modified

**Customize Triggers:**

```yaml
on:
  # Manual trigger with inputs
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to test'
        required: true
        default: 'production'
        type: choice
        options:
          - development
          - staging
          - production
  
  # Multiple schedules
  schedule:
    - cron: '0 6 * * 1-5'    # Weekdays 6 AM UTC
    - cron: '0 18 * * 1-5'   # Weekdays 6 PM UTC
    - cron: '0 12 * * 0'     # Sundays 12 PM UTC
  
  # Trigger on specific branches
  push:
    branches: [ main, develop ]
    paths:
      - 'Collection.json'
      - 'Environment.json'
      - '**.js'
  
  # Trigger on pull requests
  pull_request:
    branches: [ main ]
    paths:
      - 'Collection.json'
      - 'Environment.json'
```

### Step 5: Environment-Specific Workflows

Create separate workflows for different environments:

**`.github/workflows/test-staging.yml`:**
```yaml
name: Staging API Tests

on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours
  workflow_dispatch:

jobs:
  test-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:staging
        env:
          EMAIL_USER: ${{ secrets.EMAIL_USER }}
          EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
          EMAIL_TO: ${{ secrets.STAGING_EMAIL_TO }}
          NODE_ENV: staging
```

### Step 6: Advanced Workflow Features

**Matrix Strategy for Multiple Environments:**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [development, staging, production]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:${{ matrix.environment }}
        env:
          NODE_ENV: ${{ matrix.environment }}
          EMAIL_USER: ${{ secrets.EMAIL_USER }}
          EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
          EMAIL_TO: ${{ secrets[format('{0}_EMAIL_TO', upper(matrix.environment))] }}
```

**Conditional Execution:**
```yaml
- name: 🧪 Run Tests
  run: npm test
  if: github.event_name == 'schedule' || github.event.inputs.force_run == 'true'

- name: 📧 Send Success Notification
  if: success()
  run: echo "Tests passed!"

- name: 🚨 Send Failure Notification
  if: failure()
  run: echo "Tests failed!"
```

### Step 7: Monitoring and Notifications

**View Workflow Runs:**
1. Go to "Actions" tab in your repository
2. Click on workflow name
3. View run history and logs

**Set up Status Badges:**
Add to your README.md:
```markdown
![API Tests](https://github.com/username/repo/workflows/Enhanced%20Newman%20API%20Tests/badge.svg)
```

**Workflow Notifications:**
- GitHub will email you on workflow failures
- Configure Slack/Teams webhooks for real-time notifications
- Use GitHub mobile app for push notifications

### Step 8: Troubleshooting Common Issues

**Issue: "Secret not found"**
```
Solution: Ensure secrets are added to repository settings with exact names
```

**Issue: "npm ci failed"**
```
Solution: Ensure package-lock.json is committed to repository
```

**Issue: "Permission denied"**
```
Solution: Check if workflow has proper permissions in repository settings
```

**Issue: "Workflow not triggering"**
```yaml
# Add debugging step
- name: 🐛 Debug Trigger
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "Files changed: ${{ github.event.head_commit.modified }}"
```

### Step 9: Best Practices

1. **Use Secrets for Sensitive Data**
   - Never hardcode credentials in workflow files
   - Use environment-specific secrets

2. **Set Appropriate Timeouts**
   ```yaml
   timeout-minutes: 30  # Prevent hanging workflows
   ```

3. **Cache Dependencies**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: 'npm'  # Cache node_modules
   ```

4. **Upload Artifacts**
   ```yaml
   - uses: actions/upload-artifact@v4
     if: always()  # Upload even on failure
   ```

5. **Use Conditional Steps**
   ```yaml
   - name: Deploy
     if: github.ref == 'refs/heads/main' && success()
   ```

### Step 10: Monitoring and Maintenance

**Regular Maintenance Tasks:**
- Review workflow run history monthly
- Update action versions quarterly
- Monitor secret expiration dates
- Clean up old artifacts

**Performance Optimization:**
- Use `npm ci` instead of `npm install`
- Cache dependencies and build outputs
- Parallel job execution for multiple environments
- Optimize test execution time
