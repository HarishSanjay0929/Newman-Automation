#!/usr/bin/env node

const DataManager = require('../lib/data-manager');
const { getConfig } = require('../config/config');
const fs = require('fs');
const path = require('path');

class SetupValidator {
  constructor() {
    this.dataManager = new DataManager();
    this.config = getConfig();
  }

  async validateComplete() {
    console.log('🔍 Validating Newman Automation Setup...\n');

    const results = {
      environment: await this.validateEnvironment(),
      files: await this.validateFiles(),
      directories: await this.validateDirectories(),
      dependencies: await this.validateDependencies(),
      configuration: await this.validateConfiguration()
    };

    this.printResults(results);
    
    const allValid = Object.values(results).every(result => result.valid);
    
    if (allValid) {
      console.log('\n✅ Setup validation completed successfully!');
      console.log('🚀 Your Newman automation is ready to run.');
    } else {
      console.log('\n❌ Setup validation found issues that need attention.');
      process.exit(1);
    }

    return results;
  }

  async validateEnvironment() {
    const issues = [];
    const warnings = [];

    // Required environment variables
    const required = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_TO'];
    const optional = ['EMAIL_CC', 'EMAIL_BCC', 'SLACK_WEBHOOK_URL', 'TEAMS_WEBHOOK_URL'];

    for (const envVar of required) {
      if (!process.env[envVar]) {
        issues.push(`Missing required environment variable: ${envVar}`);
      }
    }

    for (const envVar of optional) {
      if (!process.env[envVar]) {
        warnings.push(`Optional environment variable not set: ${envVar}`);
      }
    }

    // Validate email format
    if (process.env.EMAIL_USER && !this.isValidEmail(process.env.EMAIL_USER)) {
      issues.push('EMAIL_USER is not a valid email format');
    }

    if (process.env.EMAIL_TO && !this.isValidEmail(process.env.EMAIL_TO)) {
      issues.push('EMAIL_TO is not a valid email format');
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings
    };
  }

  async validateFiles() {
    const issues = [];
    const requiredFiles = [
      'Collection.json',
      'Environment.json',
      'package.json',
      'enhanced-runner.js'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (!fs.existsSync(filePath)) {
        issues.push(`Missing required file: ${file}`);
      } else {
        // Validate JSON files
        if (file.endsWith('.json')) {
          try {
            JSON.parse(fs.readFileSync(filePath, 'utf8'));
          } catch (error) {
            issues.push(`Invalid JSON in ${file}: ${error.message}`);
          }
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  async validateDirectories() {
    const issues = [];
    const requiredDirs = ['lib', 'config', '.github/workflows'];
    const dataDirs = ['reports', 'data'];

    // Check required directories
    for (const dir of requiredDirs) {
      const dirPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(dirPath)) {
        issues.push(`Missing required directory: ${dir}`);
      }
    }

    // Create data directories if they don't exist
    for (const dir of dataDirs) {
      const dirPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(dirPath)) {
        try {
          fs.mkdirSync(dirPath, { recursive: true });
          console.log(`📁 Created directory: ${dir}`);
        } catch (error) {
          issues.push(`Cannot create directory ${dir}: ${error.message}`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  async validateDependencies() {
    const issues = [];
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
      const requiredDeps = ['newman', 'newman-reporter-htmlextra', 'nodemailer', 'axios'];

      for (const dep of requiredDeps) {
        if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
          issues.push(`Missing required dependency: ${dep}`);
        } else {
          // Check if dependency is actually installed
          try {
            require.resolve(dep);
          } catch (error) {
            issues.push(`Dependency ${dep} is not installed. Run 'npm install'`);
          }
        }
      }
    } catch (error) {
      issues.push(`Cannot read package.json: ${error.message}`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  async validateConfiguration() {
    const issues = [];

    try {
      const config = this.config;
      
      // Validate email configuration
      if (!config.email.auth.user) {
        issues.push('Email user not configured');
      }
      
      if (!config.email.auth.pass) {
        issues.push('Email password not configured');
      }

      // Validate Newman configuration
      if (!config.newman.collection) {
        issues.push('Newman collection path not configured');
      }

      if (!config.newman.environment) {
        issues.push('Newman environment path not configured');
      }

      // Check if configured files exist
      if (config.newman.collection && !fs.existsSync(config.newman.collection)) {
        issues.push(`Newman collection file not found: ${config.newman.collection}`);
      }

      if (config.newman.environment && !fs.existsSync(config.newman.environment)) {
        issues.push(`Newman environment file not found: ${config.newman.environment}`);
      }

    } catch (error) {
      issues.push(`Configuration validation error: ${error.message}`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  printResults(results) {
    for (const [category, result] of Object.entries(results)) {
      const status = result.valid ? '✅' : '❌';
      console.log(`${status} ${category.toUpperCase()}`);
      
      if (result.issues && result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`   ❌ ${issue}`));
      }
      
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => console.log(`   ⚠️ ${warning}`));
      }
      
      console.log();
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SetupValidator();
  validator.validateComplete().catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
}

module.exports = SetupValidator;
