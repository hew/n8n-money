#!/usr/bin/env node

/**
 * MCP-n8n Integration Auto-Fix Script
 * 
 * Automatically detects and fixes common MCP-n8n integration issues
 * including URL mismatches, configuration problems, and environment setup.
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const MCPDebugSuite = require('./mcp-debug-suite.js');
const MCPIntegrationValidator = require('./validate-mcp-integration.js');

class MCPIntegrationFixer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      fixesApplied: [],
      issuesDetected: [],
      backupsCreated: [],
      validationResults: null
    };
    
    this.loadEnvironment();
  }

  loadEnvironment() {
    this.env = {
      N8N_BASE_URL: process.env.N8N_BASE_URL || 'http://localhost:5678',
      N8N_API_KEY: process.env.N8N_API_KEY || null,
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || null
    };
    
    console.log('🔧 Auto-Fix Environment Loaded');
  }

  /**
   * Create backup of files before modification
   */
  async createBackup(filePath) {
    try {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      const content = await fs.readFile(filePath, 'utf8');
      await fs.writeFile(backupPath, content);
      
      this.results.backupsCreated.push({
        original: filePath,
        backup: backupPath,
        timestamp: new Date().toISOString()
      });
      
      console.log(`💾 Backup created: ${backupPath}`);
      return backupPath;
      
    } catch (error) {
      console.error(`❌ Failed to create backup for ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Run diagnostic tests to identify issues
   */
  async runDiagnostics() {
    console.log('\n🔍 Running Comprehensive Diagnostics...');

    try {
      // Run debug suite
      const debugSuite = new MCPDebugSuite();
      const debugSuccess = await debugSuite.runAll();
      
      // Run validation
      const validator = new MCPIntegrationValidator();
      const validationSuccess = await validator.runValidation();
      
      this.results.validationResults = {
        debugSuite: debugSuccess,
        validation: validationSuccess,
        debugResults: debugSuite.results,
        validationResults: validator.results
      };

      return { debugSuite, validator };
      
    } catch (error) {
      console.error(`❌ Diagnostics failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Fix webhook URL mismatches in MCP server
   */
  async fixWebhookURLMismatch(correctWebhookUrl) {
    console.log('\n🔧 Fixing Webhook URL Mismatch...');

    const mcpServerPath = path.join(__dirname, 'mcp-server.js');
    
    try {
      // Create backup
      await this.createBackup(mcpServerPath);
      
      // Read current content
      let content = await fs.readFile(mcpServerPath, 'utf8');
      
      // Find and replace webhook URL
      const webhookUrlRegex = /(webhookUrl\s*=\s*['"`])([^'"`]+)(['"`])/;
      const match = content.match(webhookUrlRegex);
      
      if (match) {
        const oldUrl = match[2];
        content = content.replace(webhookUrlRegex, `$1${correctWebhookUrl}$3`);
        
        await fs.writeFile(mcpServerPath, content);
        
        this.results.fixesApplied.push({
          type: 'webhook_url_fix',
          file: mcpServerPath,
          oldValue: oldUrl,
          newValue: correctWebhookUrl,
          success: true
        });
        
        console.log(`✅ Updated webhook URL: ${oldUrl} → ${correctWebhookUrl}`);
        return true;
        
      } else {
        console.log('⚠️ Could not find webhook URL pattern in MCP server');
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Failed to fix webhook URL: ${error.message}`);
      return false;
    }
  }

  /**
   * Fix base URL configuration mismatches
   */
  async fixBaseURLConfiguration() {
    console.log('\n🔧 Fixing Base URL Configuration...');

    const configPath = path.join(__dirname, '..', 'config', 'mcp-config.json');
    
    try {
      // Create backup
      await this.createBackup(configPath);
      
      // Read and parse config
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      let modified = false;
      
      // Fix N8N_BASE_URL in config
      const mcpServer = config.mcpServers?.['n8n-video-compilation'];
      if (mcpServer?.env?.N8N_BASE_URL && mcpServer.env.N8N_BASE_URL !== this.env.N8N_BASE_URL) {
        const oldUrl = mcpServer.env.N8N_BASE_URL;
        mcpServer.env.N8N_BASE_URL = this.env.N8N_BASE_URL;
        
        this.results.fixesApplied.push({
          type: 'base_url_config_fix',
          file: configPath,
          oldValue: oldUrl,
          newValue: this.env.N8N_BASE_URL,
          success: true
        });
        
        modified = true;
        console.log(`✅ Updated config base URL: ${oldUrl} → ${this.env.N8N_BASE_URL}`);
      }

      // Fix command to use local script instead of npx
      if (mcpServer?.command === 'npx') {
        mcpServer.command = 'node';
        mcpServer.args = ['scripts/mcp-server.js'];
        
        this.results.fixesApplied.push({
          type: 'command_fix',
          file: configPath,
          oldValue: 'npx with external package',
          newValue: 'local node script',
          success: true
        });
        
        modified = true;
        console.log('✅ Updated command to use local script');
      }

      // Save modified config
      if (modified) {
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        console.log('✅ Configuration file updated');
        return true;
      } else {
        console.log('ℹ️ No configuration changes needed');
        return true;
      }
      
    } catch (error) {
      console.error(`❌ Failed to fix base URL configuration: ${error.message}`);
      return false;
    }
  }

  /**
   * Fix environment variable issues
   */
  async fixEnvironmentVariables() {
    console.log('\n🔧 Checking Environment Variables...');

    const envPath = path.join(__dirname, '..', '.env');
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    
    try {
      let envContent = '';
      let needsUpdate = false;
      
      // Try to read existing .env file
      try {
        envContent = await fs.readFile(envPath, 'utf8');
      } catch (error) {
        // .env file doesn't exist, create it
        needsUpdate = true;
        console.log('📄 Creating new .env file...');
      }

      // Check for required variables
      const requiredVars = {
        'N8N_BASE_URL': this.env.N8N_BASE_URL,
        'N8N_API_KEY': this.env.N8N_API_KEY || 'your_n8n_api_key_here',
        'YOUTUBE_API_KEY': this.env.YOUTUBE_API_KEY || 'your_youtube_api_key_here'
      };

      let updatedContent = envContent;
      
      for (const [varName, defaultValue] of Object.entries(requiredVars)) {
        const regex = new RegExp(`^${varName}=.*$`, 'm');
        
        if (!regex.test(envContent)) {
          // Variable not found, add it
          updatedContent += `\n${varName}=${defaultValue}`;
          needsUpdate = true;
          console.log(`➕ Added ${varName} to .env file`);
        }
      }

      if (needsUpdate) {
        await fs.writeFile(envPath, updatedContent.trim() + '\n');
        
        // Create .env.example too
        const exampleContent = Object.keys(requiredVars)
          .map(key => `${key}=`)
          .join('\n') + '\n';
        await fs.writeFile(envExamplePath, exampleContent);
        
        this.results.fixesApplied.push({
          type: 'environment_variables',
          file: envPath,
          action: 'created/updated .env file',
          success: true
        });
        
        console.log('✅ Environment files created/updated');
        console.log('⚠️ Please update the API keys in .env file');
        return true;
      } else {
        console.log('ℹ️ Environment variables are configured');
        return true;
      }
      
    } catch (error) {
      console.error(`❌ Failed to fix environment variables: ${error.message}`);
      return false;
    }
  }

  /**
   * Fix workflow webhook paths based on actual configuration
   */
  async fixWorkflowWebhookPaths(validator) {
    console.log('\n🔧 Analyzing Workflow Webhook Paths...');

    if (!validator.results.workflow.workflows) {
      console.log('⚠️ No workflow data available for fixing');
      return false;
    }

    try {
      // Get the expected webhook path from config
      const configPath = path.join(__dirname, '..', 'config', 'mcp-config.json');
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      const expectedPath = config.workflows?.enhanced_video_compilation?.webhook_path;
      if (!expectedPath) {
        console.log('⚠️ No expected webhook path found in config');
        return false;
      }

      console.log(`📋 Expected webhook path: ${expectedPath}`);
      
      // Check if webhook is working with current configuration
      if (validator.results.webhook.testSuccessful) {
        console.log('✅ Webhook is already working correctly');
        return true;
      }

      // If webhook test failed, suggest correct path
      const workingUrl = validator.results.webhook.url;
      if (workingUrl) {
        console.log(`💡 Suggested fix: Update MCP server to use ${workingUrl}`);
        
        // Extract path from working URL
        const urlMatch = workingUrl.match(/\/webhook\/(.+)$/);
        if (urlMatch) {
          const correctPath = `/webhook/${urlMatch[1]}`;
          return await this.fixWebhookURLMismatch(`${this.env.N8N_BASE_URL.replace('/api', '')}${correctPath}`);
        }
      }
      
      return false;
      
    } catch (error) {
      console.error(`❌ Failed to fix webhook paths: ${error.message}`);
      return false;
    }
  }

  /**
   * Test the integration end-to-end after fixes
   */
  async testIntegrationEndToEnd() {
    console.log('\n🧪 Testing Integration End-to-End...');

    try {
      // Test webhook directly
      const webhookUrl = `${this.env.N8N_BASE_URL.replace('/api', '')}/webhook/compile-video`;
      
      const testPayload = {
        query: "test compilation after fixes",
        max_clips: 2,
        quality_threshold: 6,
        duration_preference: "short"
      };

      console.log(`🌐 Testing webhook: ${webhookUrl}`);
      
      const response = await axios.post(webhookUrl, testPayload, {
        timeout: 20000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MCP-Integration-Fixer/1.0'
        }
      });

      console.log(`✅ End-to-end test successful: ${response.status}`);
      
      this.results.fixesApplied.push({
        type: 'end_to_end_test',
        success: true,
        responseStatus: response.status,
        url: webhookUrl
      });
      
      return true;
      
    } catch (error) {
      console.error(`❌ End-to-end test failed: ${error.message}`);
      
      this.results.fixesApplied.push({
        type: 'end_to_end_test',
        success: false,
        error: error.message
      });
      
      return false;
    }
  }

  /**
   * Generate fix report
   */
  generateFixReport() {
    console.log('\n📋 Fix Report Summary:');
    
    const successfulFixes = this.results.fixesApplied.filter(fix => fix.success);
    const failedFixes = this.results.fixesApplied.filter(fix => !fix.success);
    
    console.log(`✅ Successful fixes: ${successfulFixes.length}`);
    console.log(`❌ Failed fixes: ${failedFixes.length}`);
    console.log(`💾 Backups created: ${this.results.backupsCreated.length}`);
    
    if (successfulFixes.length > 0) {
      console.log('\n🔧 Applied Fixes:');
      successfulFixes.forEach(fix => {
        console.log(`  • ${fix.type}: ${fix.file || fix.action || 'general'}`);
        if (fix.oldValue && fix.newValue) {
          console.log(`    ${fix.oldValue} → ${fix.newValue}`);
        }
      });
    }
    
    if (failedFixes.length > 0) {
      console.log('\n⚠️ Failed Fixes:');
      failedFixes.forEach(fix => {
        console.log(`  • ${fix.type}: ${fix.error || 'unknown error'}`);
      });
    }

    if (this.results.backupsCreated.length > 0) {
      console.log('\n💾 Backup Files Created:');
      this.results.backupsCreated.forEach(backup => {
        console.log(`  • ${backup.backup}`);
      });
    }
  }

  /**
   * Save fix results
   */
  async saveResults() {
    const resultsPath = path.join(__dirname, '..', 'fix-results.json');
    
    try {
      await fs.writeFile(resultsPath, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Fix results saved to: ${resultsPath}`);
    } catch (error) {
      console.error(`❌ Failed to save results: ${error.message}`);
    }
  }

  /**
   * Run auto-fix process
   */
  async runAutoFix() {
    console.log('🚀 Starting MCP-n8n Integration Auto-Fix\n');

    try {
      // Step 1: Run diagnostics
      const diagnostics = await this.runDiagnostics();
      if (!diagnostics) {
        console.error('❌ Diagnostics failed, cannot proceed with auto-fix');
        return false;
      }

      const { debugSuite, validator } = diagnostics;

      // Step 2: Fix environment variables
      await this.fixEnvironmentVariables();

      // Step 3: Fix base URL configuration
      await this.fixBaseURLConfiguration();

      // Step 4: Find working webhook URL and fix mismatches
      const workingUrls = debugSuite.results.urlTests.filter(test => 
        test.status === 200 || test.status === 201
      );

      if (workingUrls.length > 0) {
        const bestUrl = workingUrls[0].url; // Use the first working URL
        console.log(`🎯 Found working webhook URL: ${bestUrl}`);
        await this.fixWebhookURLMismatch(bestUrl);
      } else {
        console.log('⚠️ No working webhook URLs found in diagnostics');
      }

      // Step 5: Fix workflow webhook paths
      await this.fixWorkflowWebhookPaths(validator);

      // Step 6: Test integration end-to-end
      await this.testIntegrationEndToEnd();

      // Step 7: Generate and save results
      this.generateFixReport();
      await this.saveResults();

      const successCount = this.results.fixesApplied.filter(fix => fix.success).length;
      const totalFixes = this.results.fixesApplied.length;

      console.log(`\n🎯 Auto-Fix Complete! (${successCount}/${totalFixes} fixes successful)`);
      
      if (successCount === totalFixes && successCount > 0) {
        console.log('✅ All fixes applied successfully!');
        console.log('🔄 Please restart your MCP server to apply changes.');
        return true;
      } else if (successCount > 0) {
        console.log('⚠️ Some fixes were applied, but issues may remain.');
        return false;
      } else {
        console.log('❌ No fixes could be applied automatically.');
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Auto-fix process failed: ${error.message}`);
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const fixer = new MCPIntegrationFixer();
  
  fixer.runAutoFix()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = MCPIntegrationFixer;