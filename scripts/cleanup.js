#!/usr/bin/env node

const DataManager = require('../lib/data-manager');
const fs = require('fs');
const path = require('path');

class CleanupManager {
  constructor() {
    this.dataManager = new DataManager();
  }

  async runCleanup(options = {}) {
    console.log('🧹 Starting cleanup process...\n');

    const {
      reports = true,
      history = true,
      exports = true,
      dryRun = false
    } = options;

    const results = {
      reports: { cleaned: 0, errors: 0 },
      history: { trimmed: false, errors: 0 },
      exports: { cleaned: 0, errors: 0 },
      storage: { before: null, after: null }
    };

    // Get storage usage before cleanup
    results.storage.before = await this.dataManager.getStorageUsage();

    if (reports) {
      console.log('📊 Cleaning up old reports...');
      try {
        if (!dryRun) {
          await this.dataManager.cleanupOldReports(30);
        }
        results.reports.cleaned = await this.countOldFiles('reports', 30);
        console.log(`✅ Reports cleanup completed`);
      } catch (error) {
        console.error(`❌ Reports cleanup failed: ${error.message}`);
        results.reports.errors++;
      }
    }

    if (history) {
      console.log('📈 Trimming historical data...');
      try {
        if (!dryRun) {
          await this.dataManager.cleanupHistoricalData(100);
        }
        results.history.trimmed = true;
        console.log(`✅ Historical data cleanup completed`);
      } catch (error) {
        console.error(`❌ Historical data cleanup failed: ${error.message}`);
        results.history.errors++;
      }
    }

    if (exports) {
      console.log('📤 Cleaning up old exports...');
      try {
        const cleaned = await this.cleanupOldExports(dryRun);
        results.exports.cleaned = cleaned;
        console.log(`✅ Exports cleanup completed (${cleaned} files)`);
      } catch (error) {
        console.error(`❌ Exports cleanup failed: ${error.message}`);
        results.exports.errors++;
      }
    }

    // Get storage usage after cleanup
    results.storage.after = await this.dataManager.getStorageUsage();

    this.printCleanupSummary(results, dryRun);
    return results;
  }

  async countOldFiles(dirName, retentionDays) {
    const dirPath = path.join(__dirname, '..', dirName);
    if (!fs.existsSync(dirPath)) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const files = fs.readdirSync(dirPath);
    let count = 0;

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.mtime < cutoffDate) {
        count++;
      }
    }

    return count;
  }

  async cleanupOldExports(dryRun = false) {
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) return 0;

    const files = fs.readdirSync(dataDir);
    const exportFiles = files.filter(file => file.startsWith('test-export-'));
    
    // Keep only the 5 most recent exports
    const sortedExports = exportFiles
      .map(file => ({
        name: file,
        path: path.join(dataDir, file),
        mtime: fs.statSync(path.join(dataDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    const filesToDelete = sortedExports.slice(5);
    
    if (!dryRun) {
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
      }
    }

    return filesToDelete.length;
  }

  printCleanupSummary(results, dryRun) {
    console.log('\n📋 Cleanup Summary:');
    console.log('==================');
    
    if (dryRun) {
      console.log('🔍 DRY RUN - No files were actually deleted\n');
    }

    console.log(`📊 Reports: ${results.reports.cleaned} old files ${dryRun ? 'would be' : 'were'} cleaned`);
    console.log(`📈 History: ${results.history.trimmed ? 'Trimmed' : 'No trimming needed'}`);
    console.log(`📤 Exports: ${results.exports.cleaned} old files ${dryRun ? 'would be' : 'were'} cleaned`);

    if (results.storage.before && results.storage.after) {
      console.log(`\n💾 Storage Usage:`);
      console.log(`   Before: ${results.storage.before.total}`);
      if (!dryRun) {
        console.log(`   After:  ${results.storage.after.total}`);
        const beforeBytes = results.storage.before.raw.total;
        const afterBytes = results.storage.after.raw.total;
        const saved = beforeBytes - afterBytes;
        if (saved > 0) {
          const savedFormatted = this.formatBytes(saved);
          console.log(`   Saved:  ${savedFormatted}`);
        }
      }
    }

    const totalErrors = results.reports.errors + results.history.errors + results.exports.errors;
    if (totalErrors > 0) {
      console.log(`\n⚠️ ${totalErrors} errors occurred during cleanup`);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    reports: !args.includes('--no-reports'),
    history: !args.includes('--no-history'),
    exports: !args.includes('--no-exports'),
    dryRun: args.includes('--dry-run')
  };

  const cleanup = new CleanupManager();
  cleanup.runCleanup(options).catch(error => {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  });
}

module.exports = CleanupManager;
