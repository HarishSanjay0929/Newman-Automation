# Complete User Guide: Enhanced Newman API Automation

## 📖 Table of Contents
1. [System Overview](#system-overview)
2. [How It Works](#how-it-works)
3. [Quick Start for New Users](#quick-start-for-new-users)
4. [Customizing Collections & Environments](#customizing-collections--environments)
5. [GitHub Actions Setup](#github-actions-setup)
6. [Advanced Configuration](#advanced-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## 🔍 System Overview

The Enhanced Newman API Automation system transforms basic API testing into an enterprise-grade solution with:

- **Intelligent Test Execution** with retry mechanisms
- **Advanced Reporting** with trend analysis and historical tracking
- **Multi-Channel Notifications** (Email, Slack, Teams)
- **Automated Scheduling** via GitHub Actions
- **Data Management** with cleanup and export capabilities
- **Environment Support** for dev/staging/production

### Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Scheduler                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Daily     │  │   Manual    │  │   Code Changes      │ │
│  │  10:30 AM   │  │   Trigger   │  │   Auto-trigger      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Enhanced Runner (Main Orchestrator)         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Data Manager   │  │ Newman Runner   │  │   Config    │ │
│  │   - Cleanup     │  │  - Retry Logic  │  │ Management  │ │
│  │   - Validation  │  │  - Error Handle │  │ - Multi-Env │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Test Execution Phase                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Collection.json │  │Environment.json │  │ Newman CLI  │ │
│  │ (Your API Tests)│  │ (Variables)     │  │ (Execution) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Report Generation Phase                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Report Generator│  │ Trend Analysis  │  │ HTML Export │ │
│  │ - Success Rates │  │ - Historical    │  │ - Visual    │ │
│  │ - Performance   │  │ - Comparisons   │  │ - Metrics   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Notification Phase                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Email Reports   │  │ Slack Messages  │  │Teams Alerts │ │
│  │ - Rich HTML     │  │ - Real-time     │  │ - Enterprise│ │
│  │ - Attachments   │  │ - Channels      │  │ - Formatted │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ How It Works

### **Phase 1: Initialization**
1. **Environment Validation**: Checks all required environment variables and files
2. **Directory Setup**: Creates `reports/` and `data/` directories if they don't exist
3. **Cleanup Operations**: Removes old reports (30+ days) and trims historical data
4. **Configuration Loading**: Loads environment-specific settings (dev/staging/prod)

### **Phase 2: Test Execution**
1. **Newman Startup**: Initializes Newman with your collection and environment
2. **Request Processing**: Executes each API request in your collection
3. **Retry Logic**: Automatically retries failed requests up to 3 times
4. **Data Collection**: Captures response times, status codes, and assertion results

### **Phase 3: Analysis & Reporting**
1. **Data Processing**: Analyzes test results and calculates success rates
2. **Trend Analysis**: Compares current results with historical data (last 30 runs)
3. **Report Generation**: Creates enhanced HTML reports with visual metrics
4. **Historical Update**: Saves current run data to historical database

### **Phase 4: Notification Delivery**
1. **Email Composition**: Creates rich HTML email with embedded metrics
2. **Attachment Preparation**: Attaches detailed reports for download
3. **Multi-Channel Dispatch**: Sends notifications via configured channels
4. **Failure Alerts**: Triggers immediate alerts for critical failures

## 🚀 Quick Start for New Users

### **Step 1: Repository Setup**

```bash
# Clone the repository
git clone <your-repository-url>
cd newman-automation-enhanced

# Install all dependencies
npm install

# Verify installation
npm run validate
```

### **Step 2: Environment Configuration**

1. **Create your environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure email settings** (Required):
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_TO=recipient@company.com
   ```

3. **Set up Gmail App Password:**
   - Enable 2-Factor Authentication on Gmail
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail" application
   - Use this 16-character password in `EMAIL_PASS`

### **Step 3: Optional Integrations**

**Slack Integration:**
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
SLACK_CHANNEL=#api-testing
```

**Microsoft Teams Integration:**
```env
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/your-webhook-url
```

### **Step 4: First Test Run**

```bash
# Validate your setup
npm run validate

# Run your first test
npm test
```

**Expected Output:**
```
🚀 Starting Enhanced Newman Test Suite...
Environment: production
📁 Created directory: reports
📁 Created directory: data
🧪 Running Newman tests...
📊 Test Execution Summary:
   Iterations: 1
   Requests: 2
   Assertions: 4 (0 failed)
✅ Newman tests completed successfully
📄 Enhanced report saved: reports/enhanced-report.html
📧 Enhanced email report sent successfully
✅ Enhanced Newman test suite completed successfully!
```

### **Step 5: Review Results**

Check these generated files:
- **Enhanced Report**: `reports/enhanced-report.html` - Rich visual dashboard
- **Standard Report**: `reports/report.html` - Traditional Newman output
- **Historical Data**: `data/test-history.json` - Trend tracking data
- **Email Inbox**: Detailed email with metrics and attachments

## 🔄 Customizing Collections & Environments

### **Replacing Your Postman Collection**

#### **Method 1: Export from Postman**
1. Open Postman Desktop Application
2. Right-click your collection → "Export"
3. Choose "Collection v2.1" format
4. Save as `Collection.json` in project root

#### **Method 2: Use Postman API**
```bash
# Get collection via API
curl -X GET \
  https://api.getpostman.com/collections/your-collection-id \
  -H 'X-API-Key: your-api-key' \
  -o Collection.json
```

#### **Collection Requirements**
Your collection must include:
- **Test Scripts**: Assertions to validate responses
- **Environment Variables**: Dynamic data handling
- **Error Handling**: Proper failure management

**Example Test Script:**
```javascript
// Status code validation
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Response time check
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Data validation
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('status');
});

// Store data for subsequent requests
pm.test("Store authentication token", function () {
    const jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set("authToken", jsonData.token);
    }
});
```

### **Customizing Environment Variables**

#### **Export from Postman**
1. Click environment dropdown in Postman
2. Select your environment
3. Click eye icon → "Download as JSON"
4. Save as `Environment.json`

#### **Environment Structure**
```json
{
  "id": "environment-uuid",
  "name": "Your Environment Name",
  "values": [
    {
      "key": "baseUrl",
      "value": "https://api.yourcompany.com",
      "enabled": true
    },
    {
      "key": "apiKey",
      "value": "your-api-key",
      "enabled": true
    },
    {
      "key": "authToken",
      "value": "",
      "enabled": true
    }
  ]
}
```

#### **Multi-Environment Setup**
Create separate environment files:
- `Environment_dev.json` - Development settings
- `Environment_staging.json` - Staging settings  
- `Environment_prod.json` - Production settings

Update configuration in `config/config.js`:
```javascript
development: {
  newman: {
    environment: path.join(__dirname, '..', 'Environment_dev.json')
  }
},
staging: {
  newman: {
    environment: path.join(__dirname, '..', 'Environment_staging.json')
  }
}
```

### **Advanced Collection Features**

#### **Dynamic Data Generation**
```javascript
// Pre-request script for dynamic data
const timestamp = Date.now();
pm.environment.set("timestamp", timestamp);

const randomId = Math.floor(Math.random() * 1000000);
pm.environment.set("randomId", randomId);

const uuid = require('uuid');
pm.environment.set("requestId", uuid.v4());
```

#### **Authentication Handling**
```javascript
// JWT Token refresh
pm.test("Refresh token if needed", function () {
    const token = pm.environment.get("authToken");
    const tokenExpiry = pm.environment.get("tokenExpiry");
    
    if (!token || Date.now() > tokenExpiry) {
        // Token refresh logic here
        pm.sendRequest({
            url: pm.environment.get("baseUrl") + "/auth/refresh",
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            body: {
                mode: 'raw',
                raw: JSON.stringify({
                    refreshToken: pm.environment.get("refreshToken")
                })
            }
        }, function (err, response) {
            if (!err && response.code === 200) {
                const newToken = response.json().token;
                pm.environment.set("authToken", newToken);
                pm.environment.set("tokenExpiry", Date.now() + 3600000); // 1 hour
            }
        });
    }
});
```

## 📅 GitHub Actions Setup

### **Understanding the Workflow**

The workflow file `.github/workflows/run-newman.yml` defines when and how tests run:

```yaml
name: Enhanced Newman API Tests

on:
  workflow_dispatch:  # Manual trigger button
  schedule:
   - cron: '30 0 * * *'  # Daily at 10:30 AM IST
  push:
    branches: [ main ]
    paths: 
      - 'Collection.json'
      - 'Environment.json'
```

### **Cron Schedule Examples**

| Schedule | Cron Expression | Description |
|----------|----------------|-------------|
| Every hour | `0 * * * *` | Run at minute 0 of every hour |
| Business hours | `0 9-17 * * 1-5` | 9 AM to 5 PM, Monday to Friday |
| Twice daily | `0 6,18 * * *` | 6 AM and 6 PM every day |
| Weekly | `0 9 * * 1` | Every Monday at 9 AM |
| Every 15 minutes | `*/15 * * * *` | Every 15 minutes |

**Time Zone Conversion:**
- GitHub Actions uses UTC
- IST = UTC + 5:30
- For 10:30 AM IST, use `0 5 * * *` (5:00 AM UTC)

### **Setting Up GitHub Secrets**

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click "Settings" → "Secrets and variables" → "Actions"

2. **Add Required Secrets**
   
   **Essential Secrets:**
   ```
   Name: EMAIL_USER
   Value: your-email@gmail.com
   
   Name: EMAIL_PASS  
   Value: your-gmail-app-password
   
   Name: EMAIL_TO
   Value: recipient@company.com
   ```

   **Optional Secrets:**
   ```
   Name: EMAIL_CC
   Value: manager@company.com
   
   Name: SLACK_WEBHOOK_URL
   Value: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
   
   Name: TEAMS_WEBHOOK_URL
   Value: https://outlook.office.com/webhook/YOUR/TEAMS/WEBHOOK
   ```

### **Customizing Workflow Triggers**

#### **Multiple Schedules**
```yaml
on:
  schedule:
    - cron: '0 6 * * 1-5'    # Weekdays 6 AM UTC
    - cron: '0 18 * * 1-5'   # Weekdays 6 PM UTC  
    - cron: '0 12 * * 0'     # Sundays 12 PM UTC
```

#### **Manual Trigger with Options**
```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Test environment'
        required: true
        default: 'production'
        type: choice
        options:
          - development
          - staging
          - production
      notify_slack:
        description: 'Send Slack notification'
        required: false
        default: true
        type: boolean
```

#### **Conditional Execution**
```yaml
- name: Run Tests
  run: npm run test:${{ github.event.inputs.environment || 'production' }}
  
- name: Notify Slack
  if: github.event.inputs.notify_slack == 'true'
  run: echo "Sending Slack notification..."
```

### **Environment-Specific Workflows**

Create separate workflows for different environments:

**`.github/workflows/test-development.yml`:**
```yaml
name: Development API Tests

on:
  push:
    branches: [ develop ]
  schedule:
    - cron: '0 */2 * * *'  # Every 2 hours

jobs:
  test-dev:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:dev
        env:
          EMAIL_USER: ${{ secrets.EMAIL_USER }}
          EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
          EMAIL_TO: ${{ secrets.DEV_EMAIL_TO }}
          NODE_ENV: development
```

### **Advanced Workflow Features**

#### **Matrix Testing**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [development, staging, production]
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run test:${{ matrix.environment }}
```

#### **Parallel Job Execution**
```yaml
jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run API Tests
        run: npm test
        
  integration-tests:
    runs-on: ubuntu-latest
    needs: api-tests  # Wait for API tests to complete
    steps:
      - name: Run Integration Tests
        run: npm run test:integration
```

## 🔧 Advanced Configuration

### **Custom Configuration Options**

Edit `config/config.js` to customize behavior:

```javascript
// Newman execution settings
newman: {
  timeout: 30000,           // Request timeout (30 seconds)
  delayRequest: 1000,       // Delay between requests (1 second)
  iterationCount: 1,        // Number of test iterations
  bail: false,              // Continue on first failure
  suppressExitCode: true,   // Don't exit on test failures
  insecure: true           // Allow self-signed certificates
}

// Retry configuration
retry: {
  maxRetries: 3,           // Maximum retry attempts
  retryDelay: 5000,        // Delay between retries (5 seconds)
  retryOnFailure: true     // Enable retry mechanism
}

// Reporting settings
reporting: {
  includePassedTests: true,
  includeFailedTests: true,
  generateTrends: true,
  historicalDataPath: path.join(__dirname, '..', 'data', 'test-history.json')
}
```

### **Environment-Specific Overrides**

```javascript
// Development environment
development: {
  newman: {
    timeout: 60000,        // Longer timeout for debugging
    delayRequest: 2000     // Slower execution for analysis
  },
  retry: {
    maxRetries: 1          // Fewer retries in development
  }
}

// Production environment  
production: {
  newman: {
    timeout: 15000,        // Faster timeout for production
    delayRequest: 500      // Quicker execution
  },
  retry: {
    maxRetries: 5,         // More retries for reliability
    retryDelay: 10000      // Longer delay between retries
  }
}
```

### **Custom Notification Templates**

Modify notification content in `lib/notification-service.js`:

```javascript
// Custom Slack message format
createSlackPayload(reportData, trendAnalysis) {
  const status = reportData.stats.assertions.failed === 0 ? 'success' : 'failure';
  const emoji = status === 'success' ? '✅' : '❌';
  
  return {
    channel: this.config.notifications.slack.channel,
    username: 'API Test Bot',
    icon_emoji: ':robot_face:',
    text: `${emoji} API Tests ${status.toUpperCase()}`,
    attachments: [
      {
        color: status === 'success' ? 'good' : 'danger',
        fields: [
          {
            title: 'Success Rate',
            value: `${reportData.successRate}%`,
            short: true
          },
          {
            title: 'Total Tests',
            value: reportData.stats.assertions.total,
            short: true
          }
        ]
      }
    ]
  };
}
```

## 📊 Monitoring & Maintenance

### **Available Utility Commands**

```bash
# System validation
npm run validate          # Check setup and configuration
npm run storage          # View storage usage
npm run summary          # Generate test data summary

# Data management
npm run cleanup          # Clean old reports and data
npm run cleanup:dry-run  # Preview cleanup without deleting
npm run export:data      # Export test history as JSON
npm run export:csv       # Export test history as CSV

# Environment testing
npm run test:dev         # Test development environment
npm run test:staging     # Test staging environment
npm run test:prod        # Test production environment
```

### **Monitoring Dashboard Data**

The system tracks these metrics over time:
- **Success Rate Trends**: Percentage of passing tests
- **Response Time Patterns**: API performance metrics
- **Failure Analysis**: Error categorization and frequency
- **Test Coverage**: Number of assertions and requests
- **Execution Duration**: Total test runtime

### **Regular Maintenance Tasks**

#### **Weekly Tasks**
```bash
# Check system health
npm run validate

# Review storage usage
npm run storage

# Generate summary report
npm run summary
```

#### **Monthly Tasks**
```bash
# Clean up old data
npm run cleanup

# Export historical data for analysis
npm run export:csv

# Review and update environment variables
# Check GitHub Actions workflow performance
```

### **Performance Optimization**

#### **Newman Configuration Tuning**
```javascript
// For faster execution
newman: {
  timeout: 10000,          // Shorter timeout
  delayRequest: 100,       // Minimal delay
  iterationCount: 1        // Single iteration
}

// For thorough testing
newman: {
  timeout: 60000,          // Longer timeout
  delayRequest: 2000,      # Slower execution
  iterationCount: 3        # Multiple iterations
}
```

#### **GitHub Actions Optimization**
```yaml
# Cache dependencies
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'

# Use npm ci instead of npm install
- run: npm ci

# Parallel job execution
strategy:
  matrix:
    environment: [dev, staging, prod]
```

## 🔧 Troubleshooting

### **Common Issues and Solutions**

#### **Email Issues**

**Problem**: "Authentication failed" error
```
Solution:
1. Verify EMAIL_USER is correct Gmail address
2. Ensure EMAIL_PASS is Gmail App Password (not regular password)
3. Check if 2-Factor Authentication is enabled on Gmail
4. Verify App Password is 16 characters without spaces
```

**Problem**: "Email not sending"
```
Solution:
1. Check internet connectivity
2. Verify Gmail SMTP is not blocked by firewall
3. Test with a different email service
4. Check Gmail account security settings
```

#### **Newman Execution Issues**

**Problem**: "Collection file not found"
```
Solution:
1. Verify Collection.json exists in project root
2. Check file permissions (readable)
3. Validate JSON syntax with: npm run validate
4. Ensure file was exported from Postman correctly
```

**Problem**: "Environment file not found"
```
Solution:
1. Verify Environment.json exists in project root
2. Check file contains valid JSON structure
3. Ensure environment variables are properly formatted
4. Test with: newman run Collection.json -e Environment.json
```

#### **GitHub Actions Issues**

**Problem**: "Secret not found"
```
Solution:
1. Go to Repository Settings → Secrets and variables → Actions
2. Verify secret names match exactly (case-sensitive)
3. Check secret values don't contain extra spaces
4. Ensure secrets are added to correct repository
```

**Problem**: "Workflow not triggering"
```
Solution:
1. Check cron syntax with online cron validator
2. Verify branch name in workflow file matches repository
3. Ensure workflow file is in .github/workflows/ directory
4. Check GitHub Actions are enabled for repository
```

#### **Configuration Issues**

**Problem**: "Module not found" errors
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem**: "Permission denied" errors
```bash
# Solution: Fix directory permissions
chmod -R 755 reports/ data/
```

### **Debug Mode**

Enable verbose logging for troubleshooting:

```bash
# Enable debug output
DEBUG=* npm test

# Newman verbose mode
newman run Collection.json -e Environment.json --verbose

# Check specific module
DEBUG=newman:* npm test
```

### **Validation Tools**

Use built-in validation to identify issues:

```bash
# Complete system validation
npm run validate

# Check specific components
node -e "const config = require('./config/config'); console.log(config.getConfig())"

# Test email configuration
node -e "const nodemailer = require('nodemailer'); console.log('Nodemailer loaded successfully')"
```

### **Log Analysis**

Check these log sources for debugging:
- **Console Output**: Real-time execution logs
- **GitHub Actions Logs**: Workflow execution details
- **Email Delivery Logs**: SMTP transaction details
- **Newman Reports**: Detailed test execution results

### **Getting Help**

1. **Check Documentation**: Review all guide files in `docs/` directory
2. **Validate Setup**: Run `npm run validate` to identify configuration issues
3. **Review Logs**: Check console output and GitHub Actions logs
4. **Test Components**: Use individual utility commands to isolate problems
5. **Community Support**: Check Newman and Postman community forums

---

This complete guide provides everything needed to understand, customize, and maintain the Enhanced Newman API Automation system. Each section builds upon the previous ones, ensuring users can successfully implement and operate their API testing infrastructure.
