# Enhanced Newman API Automation Suite

A comprehensive API testing automation framework built with Newman, featuring advanced reporting, trend analysis, and multi-channel notifications.

## 🚀 Features

### Core Capabilities
- **Automated API Testing** with Newman and Postman collections
- **Advanced Reporting** with trend analysis and historical data
- **Multi-Channel Notifications** (Email, Slack, Teams)
- **Environment Management** (dev/staging/production)
- **Retry Mechanisms** with configurable failure handling
- **Security** with environment variable management

### Enhanced Reporting
- **Success Rate Tracking** with historical trends
- **Response Time Analysis** across test runs
- **Visual HTML Reports** with charts and metrics
- **Failure Analysis** with detailed error reporting
- **Test History** with 30-day retention

### Notification Systems
- **Email Reports** with enhanced HTML formatting
- **Slack Integration** with rich message formatting
- **Microsoft Teams** support for enterprise environments
- **Failure Alerts** for immediate issue notification

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd newman-automation-enhanced
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=recipient@company.com

# Slack Integration (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#api-testing

# Teams Integration (optional)
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR/TEAMS/WEBHOOK

# Environment
NODE_ENV=production
```

### GitHub Secrets

For GitHub Actions, configure these secrets:
- `EMAIL_USER` - Gmail address for sending reports
- `EMAIL_PASS` - Gmail app password
- `EMAIL_TO` - Recipient email address
- `SLACK_WEBHOOK_URL` (optional)
- `TEAMS_WEBHOOK_URL` (optional)

## 🎯 Usage

### Basic Usage
```bash
npm test
```

### Environment-Specific Testing
```bash
npm run test:dev      # Development environment
npm run test:staging  # Staging environment
npm run test:prod     # Production environment
```

### Legacy Mode
```bash
npm run test:legacy   # Original Newman runner
```

### Utility Commands
```bash
npm run validate      # Validate setup and configuration
npm run cleanup       # Clean up old reports and data
npm run cleanup:dry-run # Preview cleanup without deleting
npm run storage       # Check storage usage
npm run summary       # Generate test data summary
npm run export:data   # Export test history as JSON
npm run export:csv    # Export test history as CSV
```

## 📊 Reports

### Generated Reports
- **Enhanced HTML Report** - `reports/enhanced-report.html`
- **Standard Newman Report** - `reports/report.html`
- **JSON Data** - `reports/report.json`
- **Historical Data** - `data/test-history.json`

### Report Features
- Success rate trends
- Response time analysis
- Failure categorization
- Historical comparisons
- Visual metrics dashboard

## 🔧 Configuration Options

### Newman Configuration
```javascript
newman: {
  timeout: 30000,           // Request timeout
  delayRequest: 1000,       // Delay between requests
  iterationCount: 1,        // Number of iterations
  reporters: ['cli', 'htmlextra', 'json']
}
```

### Retry Configuration
```javascript
retry: {
  maxRetries: 3,           // Maximum retry attempts
  retryDelay: 5000,        // Delay between retries
  retryOnFailure: true     // Enable retry on failure
}
```

## 🔄 GitHub Actions

The workflow runs automatically:
- **Daily at 10:30 AM IST** (scheduled)
- **Manual trigger** via GitHub Actions UI
- **On push** to main branch (optional)

### Workflow Features
- Automated dependency installation
- Environment variable injection
- Report generation and email delivery
- Artifact storage for reports

## 📈 Trend Analysis

The system tracks:
- **Success Rate Trends** over time
- **Response Time Patterns** across requests
- **Failure Rate Analysis** with categorization
- **Performance Comparisons** against historical averages

## 🔔 Notifications

### Email Notifications
- Rich HTML formatting
- Embedded metrics and trends
- Attached detailed reports
- Failure-specific alerts

### Slack Integration
- Real-time test results
- Success/failure indicators
- Key metrics summary
- Configurable channels

### Teams Integration
- Enterprise-friendly formatting
- Detailed test summaries
- Visual status indicators
- Threaded conversations

## 🛠️ Development

### Project Structure
```
├── config/
│   └── config.js           # Configuration management
├── lib/
│   ├── newman-runner.js    # Newman execution engine
│   ├── report-generator.js # Enhanced reporting
│   └── notification-service.js # Multi-channel notifications
├── reports/                # Generated reports
├── data/                   # Historical test data
├── Collection.json         # Postman collection
├── Environment.json        # Environment variables
└── enhanced-runner.js      # Main application entry
```

### Adding New Features
1. Extend configuration in `config/config.js`
2. Implement feature in appropriate `lib/` module
3. Update `enhanced-runner.js` to integrate
4. Add tests and documentation

## 🔒 Security

- **Environment Variables** for sensitive data
- **GitHub Secrets** for CI/CD security
- **No Hardcoded Credentials** in source code
- **Secure Email Authentication** with app passwords

## 📝 Troubleshooting

### Common Issues

**Email not sending:**
- Verify Gmail app password is correct
- Check EMAIL_USER and EMAIL_PASS environment variables
- Ensure "Less secure app access" is enabled (if using regular password)

**Reports not generating:**
- Check Newman collection and environment files exist
- Verify reports directory permissions
- Review console logs for Newman execution errors

**Notifications not working:**
- Validate webhook URLs are correct
- Check network connectivity to Slack/Teams
- Verify webhook permissions and configuration

### Debug Mode
```bash
DEBUG=* npm test  # Enable verbose logging
```
