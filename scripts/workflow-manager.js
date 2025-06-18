#!/usr/bin/env node

/**
 * Interactive n8n Workflow Management CLI
 * 
 * A user-friendly command-line interface for managing n8n workflows with:
 * - Workflow discovery & selection
 * - Validation & repair
 * - Credential management
 * - Import & deployment
 */

const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer').default || require('inquirer');
const ora = require('ora').default || require('ora');
const axios = require('axios');

// Import chalk with proper ES module handling
let chalk;
(async () => {
  try {
    chalk = (await import('chalk')).default;
  } catch (error) {
    // Fallback for older chalk versions
    chalk = require('chalk');
  }
})();

// Fallback chalk functions if import fails
const createChalkFallback = () => ({
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  bold: {
    white: (text) => `\x1b[1m\x1b[37m${text}\x1b[0m`
  }
});

class WorkflowManager {
  constructor() {
    this.workflowsDir = path.join(__dirname, '..', 'workflows');
    this.configDir = path.join(__dirname, '..', 'config');
    this.env = this.loadEnvironment();
    this.workflows = [];
    this.validationResults = {};
    this.chalk = chalk || createChalkFallback();
    
    // Setup graceful exit
    process.on('SIGINT', this.gracefulExit.bind(this));
    process.on('SIGTERM', this.gracefulExit.bind(this));
  }

  loadEnvironment() {
    return {
      N8N_BASE_URL: process.env.N8N_BASE_URL || 'http://localhost:5678',
      N8N_API_KEY: process.env.N8N_API_KEY || null,
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || null,
      NODE_ENV: process.env.NODE_ENV || 'development'
    };
  }

  async gracefulExit() {
    console.log(this.chalk.yellow('\n\n👋 Goodbye! Thanks for using n8n Workflow Manager'));
    process.exit(0);
  }

  displayWelcome() {
    console.clear();
    console.log(this.chalk.cyan('╔═══════════════════════════════════════════════════════════════╗'));
    console.log(this.chalk.cyan('║') + (this.chalk.bold?.white || this.chalk.white)('                n8n Workflow Manager v1.0                     ') + this.chalk.cyan('║'));
    console.log(this.chalk.cyan('║') + this.chalk.gray('          Interactive CLI for n8n Workflow Management         ') + this.chalk.cyan('║'));
    console.log(this.chalk.cyan('╚═══════════════════════════════════════════════════════════════╝'));
    console.log();
  }

  async discoverWorkflows() {
    const spinner = ora('Scanning workflows directory...').start();
    
    try {
      const files = await fs.readdir(this.workflowsDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      this.workflows = [];
      
      for (const file of jsonFiles) {
        const filePath = path.join(this.workflowsDir, file);
        const stats = await fs.stat(filePath);
        
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const workflow = JSON.parse(content);
          
          this.workflows.push({
            filename: file,
            path: filePath,
            name: workflow.name || file.replace('.json', ''),
            description: this.extractDescription(workflow),
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            tags: workflow.tags || [],
            nodeCount: workflow.nodes ? workflow.nodes.length : 0,
            hasWebhook: this.hasWebhookNode(workflow),
            hasCredentials: this.hasCredentialNodes(workflow),
            isValid: true,
            workflow: workflow
          });
        } catch (error) {
          this.workflows.push({
            filename: file,
            path: filePath,
            name: file.replace('.json', ''),
            description: 'Invalid JSON - Parse Error',
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            tags: [],
            nodeCount: 0,
            hasWebhook: false,
            hasCredentials: false,
            isValid: false,
            error: error.message
          });
        }
      }
      
      spinner.succeed(`Found ${this.workflows.length} workflow(s)`);
      return this.workflows;
    } catch (error) {
      spinner.fail(`Failed to scan workflows: ${error.message}`);
      throw error;
    }
  }

  extractDescription(workflow) {
    // Look for description in various places
    if (workflow.meta?.description) return workflow.meta.description;
    if (workflow.description) return workflow.description;
    
    // Look for sticky note with description
    const stickyNotes = workflow.nodes?.filter(node => node.type === 'n8n-nodes-base.stickyNote') || [];
    if (stickyNotes.length > 0) {
      const content = stickyNotes[0].parameters?.content || '';
      const firstLine = content.split('\n')[0].replace(/[#*]/g, '').trim();
      if (firstLine.length > 0) return firstLine.substring(0, 100);
    }
    
    return 'No description available';
  }

  hasWebhookNode(workflow) {
    return workflow.nodes?.some(node => 
      node.type === 'n8n-nodes-base.webhook' || 
      node.type?.includes('webhook')
    ) || false;
  }

  hasCredentialNodes(workflow) {
    return workflow.nodes?.some(node => 
      node.credentials || 
      node.parameters?.authentication ||
      node.type?.includes('httpRequest')
    ) || false;
  }

  displayWorkflowList() {
    console.log((this.chalk.bold || this.chalk.white)('\n📋 Available Workflows:\n'));
    
    this.workflows.forEach((workflow, index) => {
      const status = workflow.isValid ? this.chalk.green('✓') : this.chalk.red('✗');
      const webhook = workflow.hasWebhook ? this.chalk.blue('🌐') : ' ';
      const creds = workflow.hasCredentials ? this.chalk.yellow('🔐') : ' ';
      const size = (workflow.size / 1024).toFixed(1) + 'KB';
      
      console.log(`${this.chalk.gray((index + 1).toString().padStart(2))}. ${status} ${webhook} ${creds} ${(this.chalk.bold || this.chalk.white)(workflow.name)}`);
      console.log(`    ${this.chalk.gray('└─')} ${workflow.description.substring(0, 80)}${workflow.description.length > 80 ? '...' : ''}`);
      console.log(`    ${this.chalk.gray('└─')} ${workflow.nodeCount} nodes, ${size}, modified ${workflow.modified.toLocaleDateString()}`);
      
      if (!workflow.isValid) {
        console.log(`    ${this.chalk.red('└─ Error:')} ${workflow.error}`);
      }
      console.log();
    });
    
    console.log(this.chalk.gray('Legend: ✓=Valid ✗=Invalid 🌐=Webhook 🔐=Credentials\n'));
  }

  async selectWorkflow() {
    if (this.workflows.length === 0) {
      console.log(this.chalk.yellow('⚠️  No workflows found in the workflows directory.'));
      return null;
    }

    const choices = this.workflows.map((workflow, index) => ({
      name: `${workflow.isValid ? '✓' : '✗'} ${workflow.name} (${workflow.nodeCount} nodes)`,
      value: index,
      short: workflow.name
    }));

    choices.push({ name: this.chalk.gray('← Back to main menu'), value: 'back' });

    const { selectedIndex } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedIndex',
      message: 'Select a workflow:',
      choices,
      pageSize: 10
    }]);

    if (selectedIndex === 'back') return null;
    return this.workflows[selectedIndex];
  }

  async validateWorkflow(workflow) {
    const spinner = ora(`Validating ${workflow.name}...`).start();
    
    try {
      const issues = [];
      const recommendations = [];

      // Basic JSON validation
      if (!workflow.isValid) {
        issues.push({
          type: 'error',
          message: 'Invalid JSON syntax',
          details: workflow.error
        });
        spinner.fail('Validation failed - Invalid JSON');
        return { valid: false, issues, recommendations };
      }

      // Workflow structure validation
      if (!workflow.workflow.nodes || workflow.workflow.nodes.length === 0) {
        issues.push({
          type: 'error',
          message: 'No nodes found in workflow',
          details: 'Workflow must contain at least one node'
        });
      }

      // Check for disconnected nodes
      const connections = workflow.workflow.connections || {};
      const connectedNodes = new Set();
      
      Object.keys(connections).forEach(nodeId => {
        connectedNodes.add(nodeId);
        const nodeConnections = connections[nodeId];
        Object.values(nodeConnections).forEach(outputs => {
          outputs.forEach(outputArray => {
            outputArray.forEach(connection => {
              connectedNodes.add(connection.node);
            });
          });
        });
      });

      const disconnectedNodes = workflow.workflow.nodes.filter(node => 
        !connectedNodes.has(node.name) && 
        !['n8n-nodes-base.start', 'n8n-nodes-base.manualTrigger', 'n8n-nodes-base.webhook', 'n8n-nodes-base.scheduleTrigger'].includes(node.type)
      );

      if (disconnectedNodes.length > 0) {
        issues.push({
          type: 'warning',
          message: `Found ${disconnectedNodes.length} disconnected node(s)`,
          details: disconnectedNodes.map(n => n.name).join(', ')
        });
      }

      // Check for missing credentials
      const credentialNodes = workflow.workflow.nodes.filter(node => 
        node.credentials || 
        (node.parameters?.authentication && node.parameters.authentication !== 'none')
      );

      if (credentialNodes.length > 0) {
        recommendations.push({
          type: 'info',
          message: `Found ${credentialNodes.length} node(s) requiring credentials`,
          details: credentialNodes.map(n => `${n.name} (${n.type})`).join(', ')
        });
      }

      // Check for webhook configuration
      const webhookNodes = workflow.workflow.nodes.filter(node => 
        node.type === 'n8n-nodes-base.webhook'
      );

      webhookNodes.forEach(node => {
        if (!node.parameters?.path) {
          issues.push({
            type: 'error',
            message: `Webhook node "${node.name}" missing path configuration`,
            details: 'Webhook nodes must have a path configured'
          });
        }
      });

      const isValid = issues.filter(i => i.type === 'error').length === 0;
      
      if (isValid) {
        spinner.succeed('Validation passed');
      } else {
        spinner.fail('Validation failed');
      }

      return { valid: isValid, issues, recommendations };
    } catch (error) {
      spinner.fail(`Validation error: ${error.message}`);
      return { 
        valid: false, 
        issues: [{ type: 'error', message: 'Validation failed', details: error.message }], 
        recommendations: [] 
      };
    }
  }

  displayValidationResults(results) {
    console.log();
    
    if (results.valid) {
      console.log(this.chalk.green('✅ Workflow validation passed!'));
    } else {
      console.log(this.chalk.red('❌ Workflow validation failed'));
    }

    if (results.issues.length > 0) {
      console.log((this.chalk.bold || this.chalk.white)('\n🔍 Issues Found:'));
      results.issues.forEach(issue => {
        const icon = issue.type === 'error' ? this.chalk.red('❌') : this.chalk.yellow('⚠️');
        console.log(`${icon} ${(this.chalk.bold || this.chalk.white)(issue.message)}`);
        if (issue.details) {
          console.log(`   ${this.chalk.gray(issue.details)}`);
        }
      });
    }

    if (results.recommendations.length > 0) {
      console.log((this.chalk.bold || this.chalk.white)('\n💡 Recommendations:'));
      results.recommendations.forEach(rec => {
        console.log(`${this.chalk.blue('ℹ️')} ${rec.message}`);
        if (rec.details) {
          console.log(`   ${this.chalk.gray(rec.details)}`);
        }
      });
    }
  }

  async testN8nConnection() {
    if (!this.env.N8N_API_KEY) {
      return { connected: false, error: 'N8N_API_KEY not configured' };
    }

    const spinner = ora('Testing n8n API connection...').start();
    
    const endpoints = ['/api/workflows', '/rest/workflows', '/api/v1/workflows'];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.env.N8N_BASE_URL}${endpoint}`, {
          headers: {
            'X-N8N-API-KEY': this.env.N8N_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        if (response.status === 200) {
          spinner.succeed(`Connected to n8n via ${endpoint}`);
          return { connected: true, endpoint };
        }
      } catch (error) {
        // Continue to next endpoint
      }
    }
    
    spinner.fail('Failed to connect to n8n API');
    return { connected: false, error: 'No working API endpoint found' };
  }

  async importWorkflow(workflow) {
    console.log((this.chalk.bold || this.chalk.white)(`\n🚀 Importing: ${workflow.name}\n`));

    // Test connection first
    const connectionTest = await this.testN8nConnection();
    if (!connectionTest.connected) {
      console.log(this.chalk.red(`❌ Cannot connect to n8n: ${connectionTest.error}`));
      return false;
    }

    const spinner = ora('Importing workflow...').start();

    try {
      // Prepare workflow data
      const importData = {
        name: workflow.workflow.name,
        nodes: workflow.workflow.nodes,
        connections: workflow.workflow.connections || {},
        settings: workflow.workflow.settings || {},
        staticData: workflow.workflow.staticData || {}
      };

      const response = await axios.post(
        `${this.env.N8N_BASE_URL}${connectionTest.endpoint}`,
        importData,
        {
          headers: {
            'X-N8N-API-KEY': this.env.N8N_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.status === 200 || response.status === 201) {
        spinner.succeed(`Successfully imported: ${workflow.name}`);
        console.log(this.chalk.green(`   ✓ Workflow ID: ${response.data.id || 'N/A'}`));
        console.log(this.chalk.blue(`   ✓ Access at: ${this.env.N8N_BASE_URL.replace('/api', '')}/workflow/${response.data.id || ''}`));
        return true;
      } else {
        spinner.fail('Import failed');
        console.log(this.chalk.red(`   Error: ${response.status} - ${response.statusText}`));
        return false;
      }
    } catch (error) {
      spinner.fail('Import failed');
      console.log(this.chalk.red(`   Error: ${error.message}`));
      if (error.response?.data) {
        console.log(this.chalk.gray(`   Details: ${JSON.stringify(error.response.data)}`));
      }
      return false;
    }
  }

  async scanCredentials(workflow) {
    const requiredCredentials = new Set();
    const credentialNodes = [];

    workflow.workflow.nodes?.forEach(node => {
      if (node.credentials) {
        Object.values(node.credentials).forEach(cred => {
          requiredCredentials.add(cred.type || cred);
        });
        credentialNodes.push(node);
      }

      // Check for API keys in HTTP requests
      if (node.type === 'n8n-nodes-base.httpRequest') {
        if (node.parameters?.url?.includes('googleapis.com')) {
          requiredCredentials.add('youtube_api_key');
        }
        if (node.parameters?.authentication) {
          requiredCredentials.add(node.parameters.authentication);
        }
      }
    });

    return {
      credentials: Array.from(requiredCredentials),
      nodes: credentialNodes
    };
  }

  async manageCredentials(workflow) {
    console.log((this.chalk.bold || this.chalk.white)(`\n🔐 Credential Management for: ${workflow.name}\n`));

    const credentialInfo = await this.scanCredentials(workflow);
    
    if (credentialInfo.credentials.length === 0) {
      console.log(this.chalk.green('✅ No credentials required for this workflow'));
      return;
    }

    console.log(this.chalk.yellow(`Found ${credentialInfo.credentials.length} credential requirement(s):`));
    credentialInfo.credentials.forEach(cred => {
      console.log(`   • ${cred}`);
    });

    console.log(this.chalk.blue('\n📋 Nodes requiring credentials:'));
    credentialInfo.nodes.forEach(node => {
      console.log(`   • ${node.name} (${node.type})`);
    });

    console.log(this.chalk.gray('\n💡 To configure credentials:'));
    console.log(this.chalk.gray('   1. Open n8n web interface'));
    console.log(this.chalk.gray('   2. Go to Settings > Credentials'));
    console.log(this.chalk.gray('   3. Add the required credential types'));
    console.log(this.chalk.gray('   4. Update the workflow nodes to use the credentials'));
  }

  async showMainMenu() {
    const choices = [
      { name: '🔍 Discover & View Workflows', value: 'discover' },
      { name: '✅ Validate Workflow', value: 'validate' },
      { name: '🔐 Manage Credentials', value: 'credentials' },
      { name: '📤 Import Workflow to n8n', value: 'import' },
      { name: '🔧 Test n8n Connection', value: 'test' },
      { name: '🛠️  Run Integration Tools', value: 'tools' },
      new inquirer.Separator(),
      { name: '❓ Help & Usage', value: 'help' },
      { name: '🚪 Exit', value: 'exit' }
    ];

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices
    }]);

    return action;
  }

  async showHelp() {
    console.log((this.chalk.bold || this.chalk.white)('\n📖 n8n Workflow Manager Help\n'));
    
    console.log(this.chalk.blue('🔍 Discover & View Workflows'));
    console.log('   Scans the ./workflows/ directory and displays all available workflows');
    console.log('   Shows workflow metadata, node count, and validation status');
    
    console.log(this.chalk.blue('\n✅ Validate Workflow'));
    console.log('   Checks workflow JSON syntax and n8n-specific configuration');
    console.log('   Identifies missing connections, credential requirements, and common issues');
    
    console.log(this.chalk.blue('\n🔐 Manage Credentials'));
    console.log('   Scans workflow for credential requirements');
    console.log('   Provides guidance on setting up credentials in n8n');
    
    console.log(this.chalk.blue('\n📤 Import Workflow to n8n'));
    console.log('   Tests API connection and imports validated workflows');
    console.log('   Handles multiple API endpoints and provides import status');
    
    console.log(this.chalk.blue('\n🔧 Test n8n Connection'));
    console.log('   Verifies n8n API connectivity and finds working endpoints');
    
    console.log(this.chalk.blue('\n🛠️  Run Integration Tools'));
    console.log('   Access existing debug and validation tools');
    console.log('   Run MCP integration checks and fixes');
    
    console.log(this.chalk.gray('\n📋 Environment Variables:'));
    console.log(this.chalk.gray('   N8N_BASE_URL - n8n server URL (default: http://localhost:5678)'));
    console.log(this.chalk.gray('   N8N_API_KEY - n8n API key (required for import/test)'));
    console.log(this.chalk.gray('   YOUTUBE_API_KEY - YouTube API key (for video workflows)'));
    
    await inquirer.prompt([{
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    }]);
  }

  async runIntegrationTools() {
    const choices = [
      { name: '🔍 Run MCP Debug Suite', value: 'debug' },
      { name: '✅ Validate MCP Integration', value: 'validate' },
      { name: '🔧 Fix MCP Integration', value: 'fix' },
      { name: '📋 Full Health Check', value: 'health' },
      new inquirer.Separator(),
      { name: '← Back to main menu', value: 'back' }
    ];

    const { tool } = await inquirer.prompt([{
      type: 'list',
      name: 'tool',
      message: 'Select integration tool:',
      choices
    }]);

    if (tool === 'back') return;

    const toolScripts = {
      debug: 'mcp-debug-suite.js',
      validate: 'validate-mcp-integration.js',
      fix: 'fix-mcp-integration.js'
    };

    if (toolScripts[tool]) {
      console.log(this.chalk.blue(`\n🔧 Running ${toolScripts[tool]}...\n`));
      
      const { spawn } = require('child_process');
      const scriptPath = path.join(__dirname, toolScripts[tool]);
      
      return new Promise((resolve) => {
        const child = spawn('node', [scriptPath], { 
          stdio: 'inherit',
          cwd: __dirname 
        });
        
        child.on('close', (code) => {
          console.log(this.chalk.gray(`\n✅ Tool completed with exit code: ${code}`));
          resolve();
        });
      });
    } else if (tool === 'health') {
      const connectionTest = await this.testN8nConnection();
      console.log(connectionTest.connected ? 
        this.chalk.green('✅ n8n API: Connected') : 
        this.chalk.red(`❌ n8n API: ${connectionTest.error}`)
      );
      
      console.log(this.env.N8N_API_KEY ? 
        this.chalk.green('✅ N8N_API_KEY: Configured') : 
        this.chalk.red('❌ N8N_API_KEY: Missing')
      );
      
      console.log(this.env.YOUTUBE_API_KEY ? 
        this.chalk.green('✅ YOUTUBE_API_KEY: Configured') : 
        this.chalk.yellow('⚠️  YOUTUBE_API_KEY: Not configured')
      );
    }
  }

  async run() {
    // Initialize chalk properly
    if (!chalk) {
      this.chalk = createChalkFallback();
    }
    
    this.displayWelcome();
    
    // Discover workflows on startup
    await this.discoverWorkflows();
    
    while (true) {
      try {
        const action = await this.showMainMenu();
        
        switch (action) {
          case 'discover':
            await this.discoverWorkflows();
            this.displayWorkflowList();
            break;
            
          case 'validate':
            const workflowToValidate = await this.selectWorkflow();
            if (workflowToValidate) {
              const results = await this.validateWorkflow(workflowToValidate);
              this.displayValidationResults(results);
            }
            break;
            
          case 'credentials':
            const workflowForCreds = await this.selectWorkflow();
            if (workflowForCreds) {
              await this.manageCredentials(workflowForCreds);
            }
            break;
            
          case 'import':
            const workflowToImport = await this.selectWorkflow();
            if (workflowToImport) {
              const validation = await this.validateWorkflow(workflowToImport);
              if (validation.valid || validation.issues.filter(i => i.type === 'error').length === 0) {
                const { confirm } = await inquirer.prompt([{
                  type: 'confirm',
                  name: 'confirm',
                  message: `Import "${workflowToImport.name}" to n8n?`,
                  default: true
                }]);
                
                if (confirm) {
                  await this.importWorkflow(workflowToImport);
                }
              } else {
                console.log(this.chalk.red('\n❌ Cannot import workflow with validation errors'));
                this.displayValidationResults(validation);
              }
            }
            break;
            
          case 'test':
            await this.testN8nConnection();
            break;
            
          case 'tools':
            await this.runIntegrationTools();
            break;
            
          case 'help':
            await this.showHelp();
            break;
            
          case 'exit':
            await this.gracefulExit();
            break;
        }
        
        if (action !== 'exit' && action !== 'help') {
          await inquirer.prompt([{
            type: 'input',
            name: 'continue',
            message: '\nPress Enter to continue...'
          }]);
        }
        
      } catch (error) {
        console.error(this.chalk.red(`\n❌ Error: ${error.message}`));
        
        const { continue: shouldContinue } = await inquirer.prompt([{
          type: 'confirm',
          name: 'continue',
          message: 'Continue using the workflow manager?',
          default: true
        }]);
        
        if (!shouldContinue) {
          await this.gracefulExit();
        }
      }
    }
  }
}

// Start the CLI
async function main() {
  try {
    const manager = new WorkflowManager();
    await manager.run();
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = WorkflowManager;