const fs = require('fs');
const path = require('path');
const { getConfig } = require('../config/config');

class DataManager {
  constructor() {
    this.config = getConfig();
    this.dataDir = path.join(__dirname, '..', 'data');
    this.reportsDir = path.join(__dirname, '..', 'reports');
  }

  async initializeDataDirectories() {
    try {
      // Ensure data directories exist
      [this.dataDir, this.reportsDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`📁 Created directory: ${dir}`);
        }
      });

      // Initialize test history file if it doesn't exist
      const historyPath = this.config.reporting.historicalDataPath;
      if (!fs.existsSync(historyPath)) {
        fs.writeFileSync(historyPath, JSON.stringify([], null, 2));
        console.log(`📄 Initialized test history file: ${historyPath}`);
      }

    } catch (error) {
      console.error('❌ Error initializing data directories:', error.message);
      throw error;
    }
  }

  async cleanupOldReports(retentionDays = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const files = fs.readdirSync(this.reportsDir);
      let cleanedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.reportsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          cleanedCount++;
          console.log(`🗑️ Cleaned up old report: ${file}`);
        }
      }

      if (cleanedCount > 0) {
        console.log(`✅ Cleaned up ${cleanedCount} old report files`);
      }

    } catch (error) {
      console.error('❌ Error cleaning up old reports:', error.message);
    }
  }

  async cleanupHistoricalData(maxEntries = 100) {
    try {
      const historyPath = this.config.reporting.historicalDataPath;
      
      if (!fs.existsSync(historyPath)) {
        return;
      }

      const data = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      
      if (data.length > maxEntries) {
        const trimmedData = data.slice(-maxEntries);
        fs.writeFileSync(historyPath, JSON.stringify(trimmedData, null, 2));
        console.log(`🗂️ Trimmed historical data to ${maxEntries} entries`);
      }

    } catch (error) {
      console.error('❌ Error cleaning up historical data:', error.message);
    }
  }

  async generateTestDataSummary() {
    try {
      const historyPath = this.config.reporting.historicalDataPath;
      
      if (!fs.existsSync(historyPath)) {
        return { message: 'No historical data available' };
      }

      const data = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      
      if (data.length === 0) {
        return { message: 'No test runs recorded' };
      }

      const summary = {
        totalRuns: data.length,
        dateRange: {
          first: data[0].timestamp,
          last: data[data.length - 1].timestamp
        },
        averageSuccessRate: (data.reduce((sum, run) => sum + parseFloat(run.successRate), 0) / data.length).toFixed(2),
        averageDuration: Math.round(data.reduce((sum, run) => sum + run.duration, 0) / data.length),
        totalAssertions: data.reduce((sum, run) => sum + run.stats.assertions.total, 0),
        totalFailures: data.reduce((sum, run) => sum + run.stats.assertions.failed, 0),
        recentTrend: this.calculateRecentTrend(data.slice(-7))
      };

      return summary;

    } catch (error) {
      console.error('❌ Error generating test data summary:', error.message);
      return { error: error.message };
    }
  }

  calculateRecentTrend(recentData) {
    if (recentData.length < 2) {
      return 'insufficient_data';
    }

    const recent = recentData.slice(-3);
    const older = recentData.slice(0, -3);

    if (older.length === 0) {
      return 'insufficient_data';
    }

    const recentAvg = recent.reduce((sum, run) => sum + parseFloat(run.successRate), 0) / recent.length;
    const olderAvg = older.reduce((sum, run) => sum + parseFloat(run.successRate), 0) / older.length;

    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  }

  async exportTestData(format = 'json') {
    try {
      const historyPath = this.config.reporting.historicalDataPath;
      
      if (!fs.existsSync(historyPath)) {
        throw new Error('No historical data available for export');
      }

      const data = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      let exportPath, exportContent;

      switch (format.toLowerCase()) {
        case 'csv':
          exportPath = path.join(this.dataDir, `test-export-${timestamp}.csv`);
          exportContent = this.convertToCSV(data);
          break;
        case 'json':
        default:
          exportPath = path.join(this.dataDir, `test-export-${timestamp}.json`);
          exportContent = JSON.stringify(data, null, 2);
          break;
      }

      fs.writeFileSync(exportPath, exportContent);
      console.log(`📤 Test data exported to: ${exportPath}`);
      
      return exportPath;

    } catch (error) {
      console.error('❌ Error exporting test data:', error.message);
      throw error;
    }
  }

  convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = [
      'timestamp',
      'duration',
      'successRate',
      'totalAssertions',
      'failedAssertions',
      'totalRequests',
      'failedRequests'
    ];

    const rows = data.map(run => [
      run.timestamp,
      run.duration,
      run.successRate,
      run.stats.assertions.total,
      run.stats.assertions.failed,
      run.stats.requests.total,
      run.stats.requests.failed
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  async validateTestEnvironment() {
    const issues = [];

    try {
      // Check required files
      const requiredFiles = [
        path.join(__dirname, '..', 'Collection.json'),
        path.join(__dirname, '..', 'Environment.json')
      ];

      for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
          issues.push(`Missing required file: ${path.basename(file)}`);
        }
      }

      // Check environment variables
      const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_TO'];
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          issues.push(`Missing environment variable: ${envVar}`);
        }
      }

      // Check directory permissions
      try {
        const testFile = path.join(this.dataDir, 'test-write.tmp');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
      } catch (error) {
        issues.push(`Data directory not writable: ${this.dataDir}`);
      }

      try {
        const testFile = path.join(this.reportsDir, 'test-write.tmp');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
      } catch (error) {
        issues.push(`Reports directory not writable: ${this.reportsDir}`);
      }

      return {
        valid: issues.length === 0,
        issues: issues
      };

    } catch (error) {
      return {
        valid: false,
        issues: [`Validation error: ${error.message}`]
      };
    }
  }

  async getStorageUsage() {
    try {
      const getDirectorySize = (dirPath) => {
        if (!fs.existsSync(dirPath)) return 0;
        
        let totalSize = 0;
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            totalSize += getDirectorySize(filePath);
          } else {
            totalSize += stats.size;
          }
        }
        
        return totalSize;
      };

      const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      const dataSize = getDirectorySize(this.dataDir);
      const reportsSize = getDirectorySize(this.reportsDir);
      const totalSize = dataSize + reportsSize;

      return {
        data: formatBytes(dataSize),
        reports: formatBytes(reportsSize),
        total: formatBytes(totalSize),
        raw: {
          data: dataSize,
          reports: reportsSize,
          total: totalSize
        }
      };

    } catch (error) {
      console.error('❌ Error calculating storage usage:', error.message);
      return { error: error.message };
    }
  }
}

module.exports = DataManager;
