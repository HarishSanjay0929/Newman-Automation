const fs = require('fs');
const path = require('path');
const { getConfig } = require('../config/config');

class ReportGenerator {
  constructor() {
    this.config = getConfig();
  }

  async generateEnhancedReport(newmanSummary) {
    try {
      const reportData = this.extractReportData(newmanSummary);
      const historicalData = this.loadHistoricalData();
      
      // Update historical data
      historicalData.push(reportData);
      this.saveHistoricalData(historicalData);
      
      // Generate trend analysis
      const trendAnalysis = this.generateTrendAnalysis(historicalData);
      
      // Create enhanced HTML report
      const enhancedHtml = this.createEnhancedHtmlReport(reportData, trendAnalysis);
      
      return {
        reportData,
        trendAnalysis,
        enhancedHtml
      };
    } catch (error) {
      console.error('❌ Error generating enhanced report:', error.message);
      throw error;
    }
  }

  extractReportData(summary) {
    const stats = summary.run.stats;
    const executions = summary.run.executions || [];
    
    return {
      timestamp: new Date().toISOString(),
      duration: summary.run.timings.completed - summary.run.timings.started,
      stats: {
        iterations: stats.iterations.total,
        requests: {
          total: stats.requests.total,
          failed: stats.requests.failed
        },
        assertions: {
          total: stats.assertions.total,
          failed: stats.assertions.failed
        },
        testScripts: {
          total: stats.testScripts.total,
          failed: stats.testScripts.failed
        }
      },
      successRate: ((stats.assertions.total - stats.assertions.failed) / stats.assertions.total * 100).toFixed(2),
      failures: summary.run.failures || [],
      executions: executions.map(exec => ({
        name: exec.item.name,
        responseTime: exec.response ? exec.response.responseTime : 0,
        responseCode: exec.response ? exec.response.code : 0,
        assertions: exec.assertions ? exec.assertions.map(a => ({
          assertion: a.assertion,
          error: a.error ? a.error.message : null
        })) : []
      }))
    };
  }

  loadHistoricalData() {
    const historyPath = this.config.reporting.historicalDataPath;
    
    try {
      if (fs.existsSync(historyPath)) {
        const data = fs.readFileSync(historyPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.log('⚠️ Could not load historical data, starting fresh');
    }
    
    return [];
  }

  saveHistoricalData(data) {
    const historyPath = this.config.reporting.historicalDataPath;
    const historyDir = path.dirname(historyPath);
    
    // Ensure directory exists
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }
    
    // Keep only last 30 runs
    const trimmedData = data.slice(-30);
    
    fs.writeFileSync(historyPath, JSON.stringify(trimmedData, null, 2));
  }

  generateTrendAnalysis(historicalData) {
    if (historicalData.length < 2) {
      return { message: 'Insufficient data for trend analysis' };
    }

    const recent = historicalData.slice(-7); // Last 7 runs
    const avgSuccessRate = recent.reduce((sum, run) => sum + parseFloat(run.successRate), 0) / recent.length;
    const avgDuration = recent.reduce((sum, run) => sum + run.duration, 0) / recent.length;
    const avgResponseTime = this.calculateAverageResponseTime(recent);

    const current = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];

    return {
      current: {
        successRate: parseFloat(current.successRate),
        duration: current.duration,
        totalAssertions: current.stats.assertions.total,
        failedAssertions: current.stats.assertions.failed
      },
      trends: {
        successRate: {
          current: parseFloat(current.successRate),
          average: avgSuccessRate.toFixed(2),
          trend: parseFloat(current.successRate) > parseFloat(previous.successRate) ? 'up' : 'down'
        },
        duration: {
          current: current.duration,
          average: Math.round(avgDuration),
          trend: current.duration < previous.duration ? 'up' : 'down'
        },
        responseTime: {
          average: avgResponseTime.toFixed(2)
        }
      },
      summary: this.generateTrendSummary(current, previous, avgSuccessRate)
    };
  }

  calculateAverageResponseTime(runs) {
    let totalResponseTime = 0;
    let totalRequests = 0;

    runs.forEach(run => {
      run.executions.forEach(exec => {
        totalResponseTime += exec.responseTime;
        totalRequests++;
      });
    });

    return totalRequests > 0 ? totalResponseTime / totalRequests : 0;
  }

  generateTrendSummary(current, previous, avgSuccessRate) {
    const messages = [];
    
    if (parseFloat(current.successRate) > parseFloat(previous.successRate)) {
      messages.push('✅ Success rate improved');
    } else if (parseFloat(current.successRate) < parseFloat(previous.successRate)) {
      messages.push('⚠️ Success rate declined');
    }

    if (parseFloat(current.successRate) > avgSuccessRate) {
      messages.push('📈 Above average performance');
    } else if (parseFloat(current.successRate) < avgSuccessRate) {
      messages.push('📉 Below average performance');
    }

    if (current.stats.assertions.failed === 0) {
      messages.push('🎉 All tests passed!');
    }

    return messages.length > 0 ? messages : ['📊 Performance stable'];
  }

  createEnhancedHtmlReport(reportData, trendAnalysis) {
    const timestamp = new Date(reportData.timestamp).toLocaleString();
    const duration = (reportData.duration / 1000).toFixed(2);

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Enhanced Newman Test Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .metric-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
    .metric-label { color: #666; font-size: 0.9em; }
    .success { color: #28a745; }
    .warning { color: #ffc107; }
    .danger { color: #dc3545; }
    .trend-up::after { content: ' ↗️'; }
    .trend-down::after { content: ' ↘️'; }
    .chart-container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .execution-table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .execution-table th, .execution-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    .execution-table th { background: #f8f9fa; font-weight: 600; }
    .status-pass { color: #28a745; font-weight: bold; }
    .status-fail { color: #dc3545; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Enhanced Newman Test Report</h1>
      <p>Generated on ${timestamp} | Duration: ${duration}s</p>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value ${reportData.stats.assertions.failed === 0 ? 'success' : 'danger'}">${reportData.successRate}%</div>
        <div class="metric-label">Success Rate</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${reportData.stats.assertions.total}</div>
        <div class="metric-label">Total Assertions</div>
      </div>
      <div class="metric-card">
        <div class="metric-value ${reportData.stats.assertions.failed === 0 ? 'success' : 'danger'}">${reportData.stats.assertions.failed}</div>
        <div class="metric-label">Failed Assertions</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${reportData.stats.requests.total}</div>
        <div class="metric-label">Total Requests</div>
      </div>
    </div>

    ${trendAnalysis.trends ? `
    <div class="chart-container">
      <h3>📈 Trend Analysis</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value ${trendAnalysis.trends.successRate.trend === 'up' ? 'success trend-up' : 'danger trend-down'}">${trendAnalysis.trends.successRate.current}%</div>
          <div class="metric-label">Current vs Avg (${trendAnalysis.trends.successRate.average}%)</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${(trendAnalysis.trends.duration.current / 1000).toFixed(2)}s</div>
          <div class="metric-label">Duration vs Avg (${(trendAnalysis.trends.duration.average / 1000).toFixed(2)}s)</div>
        </div>
      </div>
      <div style="margin-top: 15px;">
        ${trendAnalysis.summary.map(msg => `<span style="display: inline-block; margin: 5px; padding: 5px 10px; background: #e9ecef; border-radius: 15px; font-size: 0.9em;">${msg}</span>`).join('')}
      </div>
    </div>
    ` : ''}

    <div class="chart-container">
      <h3>🔍 Request Details</h3>
      <table class="execution-table">
        <thead>
          <tr>
            <th>Request</th>
            <th>Response Time</th>
            <th>Status Code</th>
            <th>Assertions</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.executions.map(exec => {
            const failedAssertions = exec.assertions.filter(a => a.error).length;
            const status = failedAssertions === 0 ? 'Pass' : 'Fail';
            const statusClass = failedAssertions === 0 ? 'status-pass' : 'status-fail';
            
            return `
            <tr>
              <td>${exec.name}</td>
              <td>${exec.responseTime}ms</td>
              <td>${exec.responseCode}</td>
              <td>${exec.assertions.length - failedAssertions}/${exec.assertions.length}</td>
              <td class="${statusClass}">${status}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    ${reportData.failures.length > 0 ? `
    <div class="chart-container">
      <h3>❌ Failures</h3>
      ${reportData.failures.map((failure, index) => `
        <div style="margin-bottom: 15px; padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px;">
          <strong>${failure.source.name || 'Unknown'}</strong><br>
          <span style="color: #721c24;">${failure.error.message}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 0.9em;">
      <p>This is an automated report generated by Newman API Testing Framework</p>
    </div>
  </div>
</body>
</html>`;
  }
}

module.exports = ReportGenerator;
