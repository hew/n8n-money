#!/usr/bin/env node

/**
 * MCP-n8n Integration Validator
 * 
 * Validates n8n workflow status, webhook configuration, API credentials,
 * and environment variables for proper MCP integration.
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class MCPIntegrationValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      validationStatus: 'PENDING',
      environment: {},
      workflow: {},
      webhook: {},
      credentials: {},
      configuration: {},
      issues: [],
      recommendations: []
    };
    
    this.loadEnvironment();
  }

  loadEnvironment() {
    this.env = {
      N8N_BASE_URL: process.env.N8N_BASE_URL || 'http://localhost:5678',
      N8N_API_KEY: process.env.N8N_API_KEY || null,
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || null,
      NODE_ENV: process.env.NODE_ENV || 'development'
    };
    
    this.results.environment = { ...this.env };
    console.log('🔧 Environment Variables Loaded');
  }

  /**
   * Validate n8n workflow status and configuration
   */
  async validateWorkflow() {
    console.log('\n🔍 Validating n8n Workflow...');
    
    if (!this.env.N8N_API_KEY) {
      this.addIssue('CRITICAL', 'No N8N_API_KEY found', 'Set N8N_API_KEY environment variable');
      return false;
    }

    try {
      // Get all workflows
      const workflowsResponse = await axios.get(`${this.env.N8N_BASE_URL}/api/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.env.N8N_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const workflows = workflowsResponse.data.data || workflowsResponse.data;
      console.log(`📋 Found ${workflows.length} workflows`);

      // Find video compilation workflows
      const videoWorkflows = workflows.filter(w => 
        w.name.toLowerCase().includes('video') || 
        w.name.toLowerCase().includes('compilation') ||
        w.nodes?.some(n => n.type === 'n8n-nodes-base.webhook' && 
          n.parameters?.path?.includes('compile'))
      );

      if (videoWorkflows.length === 0) {
        this.addIssue('ERROR', 'No video compilation workflows found', 'Import the video-generation-workflow.json');
        return false;
      }

      console.log(`🎥 Found ${videoWorkflows.length} video compilation workflow(s)`);

      // Validate each video workflow
      for (const workflow of videoWorkflows) {
        await this.validateSpecificWorkflow(workflow);
      }

      this.results.workflow.status = 'VALID';
      this.results.workflow.count = videoWorkflows.length;
      this.results.workflow.workflows = videoWorkflows.map(w => ({
        id: w.id,
        name: w.name,
        active: w.active,
        tags: w.tags
      }));

      return true;

    } catch (error) {
      this.addIssue('CRITICAL', `Failed to access n8n API: ${error.message}`, 'Check n8n connection and API key');
      return false;
    }
  }

  /**
   * Validate a specific workflow configuration
   */
  async validateSpecificWorkflow(workflow) {
    console.log(`\n🔧 Validating workflow: ${workflow.name} (ID: ${workflow.id})`);

    try {
      // Get detailed workflow info
      const detailResponse = await axios.get(`${this.env.N8N_BASE_URL}/api/workflows/${workflow.id}`, {
        headers: {
          'X-N8N-API-KEY': this.env.N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      const workflowDetail = detailResponse.data;
      
      // Check if workflow is active
      if (!workflowDetail.active) {
        this.addIssue('WARNING', `Workflow "${workflow.name}" is not active`, 'Activate the workflow in n8n');
      } else {
        console.log('✅ Workflow is active');
      }

      // Find webhook nodes
      const webhookNodes = workflowDetail.nodes?.filter(node => 
        node.type === 'n8n-nodes-base.webhook'
      ) || [];

      if (webhookNodes.length === 0) {
        this.addIssue('ERROR', `No webhook nodes found in "${workflow.name}"`, 'Add webhook trigger node');
        return;
      }

      // Validate webhook configuration
      for (const webhookNode of webhookNodes) {
        await this.validateWebhookNode(workflow, webhookNode);
      }

      // Check for YouTube API nodes
      await this.validateYouTubeIntegration(workflowDetail);

      // Check for AI/OpenAI nodes
      await this.validateAIIntegration(workflowDetail);

    } catch (error) {
      this.addIssue('ERROR', `Failed to validate workflow "${workflow.name}": ${error.message}`, 'Check workflow configuration');
    }
  }

  /**
   * Validate webhook node configuration
   */
  async validateWebhookNode(workflow, webhookNode) {
    console.log(`🌐 Validating webhook node: ${webhookNode.name}`);

    const webhookPath = webhookNode.parameters?.path;
    if (!webhookPath) {
      this.addIssue('ERROR', 'Webhook node has no path configured', 'Set webhook path in node parameters');
      return;
    }

    const fullWebhookUrl = `${this.env.N8N_BASE_URL.replace('/api', '')}/webhook/${webhookPath}`;
    
    // Test webhook accessibility
    try {
      const testPayload = {
        query: "validation test",
        max_clips: 1,
        quality_threshold: 5,
        duration_preference: "short"
      };

      console.log(`🧪 Testing webhook: ${fullWebhookUrl}`);
      
      const response = await axios.post(fullWebhookUrl, testPayload, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MCP-Integration-Validator/1.0'
        }
      });

      console.log(`✅ Webhook responds: ${response.status}`);
      
      this.results.webhook = {
        status: 'WORKING',
        url: fullWebhookUrl,
        path: webhookPath,
        responseStatus: response.status,
        testSuccessful: true
      };

    } catch (error) {
      const status = error.response?.status || 'ERROR';
      this.addIssue('ERROR', `Webhook test failed: ${status} - ${error.message}`, 'Check webhook configuration and workflow status');
      
      this.results.webhook = {
        status: 'FAILED',
        url: fullWebhookUrl,
        path: webhookPath,
        error: error.message,
        testSuccessful: false
      };
    }
  }

  /**
   * Validate YouTube API integration
   */
  async validateYouTubeIntegration(workflow) {
    console.log('\n📺 Validating YouTube API Integration...');

    const youtubeNodes = workflow.nodes?.filter(node => 
      node.type === 'n8n-nodes-base.httpRequest' &&
      (node.parameters?.url?.includes('googleapis.com/youtube') ||
       node.parameters?.queryParameters?.parameters?.some(p => p.name === 'key'))
    ) || [];

    if (youtubeNodes.length === 0) {
      this.addIssue('WARNING', 'No YouTube API nodes found', 'Workflow may not be able to search YouTube');
      return;
    }

    console.log(`🔍 Found ${youtubeNodes.length} YouTube API node(s)`);

    // Check for hardcoded API keys (security issue)
    let foundHardcodedKey = false;
    for (const node of youtubeNodes) {
      const queryParams = node.parameters?.queryParameters?.parameters || [];
      const keyParam = queryParams.find(p => p.name === 'key');
      
      if (keyParam && keyParam.value && !keyParam.value.startsWith('{{')) {
        this.addIssue('SECURITY', 'Hardcoded YouTube API key found', 'Use environment variables for API keys');
        foundHardcodedKey = true;
      }
    }

    if (!foundHardcodedKey) {
      console.log('✅ No hardcoded API keys detected');
    }

    // Test YouTube API if key is available
    if (this.env.YOUTUBE_API_KEY) {
      await this.testYouTubeAPI();
    } else {
      this.addIssue('WARNING', 'No YOUTUBE_API_KEY environment variable', 'Set YOUTUBE_API_KEY for YouTube integration');
    }

    this.results.credentials.youtube = {
      nodesFound: youtubeNodes.length,
      keyConfigured: !!this.env.YOUTUBE_API_KEY,
      securityOk: !foundHardcodedKey
    };
  }

  /**
   * Test YouTube API connectivity
   */
  async testYouTubeAPI() {
    console.log('🧪 Testing YouTube API connectivity...');

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: 'test',
          type: 'video',
          maxResults: 1,
          key: this.env.YOUTUBE_API_KEY
        },
        timeout: 10000
      });

      console.log('✅ YouTube API test successful');
      this.results.credentials.youtube.apiWorking = true;

    } catch (error) {
      this.addIssue('ERROR', `YouTube API test failed: ${error.message}`, 'Check YouTube API key and quota');
      this.results.credentials.youtube.apiWorking = false;
    }
  }

  /**
   * Validate AI integration (OpenAI, etc.)
   */
  async validateAIIntegration(workflow) {
    console.log('\n🤖 Validating AI Integration...');

    const aiNodes = workflow.nodes?.filter(node => 
      node.type?.includes('openAi') || 
      node.type?.includes('langchain') ||
      node.credentials
    ) || [];

    if (aiNodes.length === 0) {
      this.addIssue('INFO', 'No AI nodes found', 'Workflow may not use AI features');
      return;
    }

    console.log(`🧠 Found ${aiNodes.length} AI node(s)`);

    this.results.credentials.ai = {
      nodesFound: aiNodes.length,
      types: [...new Set(aiNodes.map(n => n.type))]
    };

    console.log('✅ AI integration detected');
  }

  /**
   * Validate MCP configuration files
   */
  async validateMCPConfiguration() {
    console.log('\n⚙️ Validating MCP Configuration...');

    const configPath = path.join(__dirname, '..', 'config', 'mcp-config.json');
    
    try {
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      // Validate configuration structure
      if (!config.mcpServers) {
        this.addIssue('ERROR', 'MCP config missing mcpServers section', 'Add mcpServers configuration');
        return;
      }

      const mcpServer = config.mcpServers['n8n-video-compilation'];
      if (!mcpServer) {
        this.addIssue('ERROR', 'n8n-video-compilation server not configured', 'Add server configuration');
        return;
      }

      // Check environment variables in config
      const configBaseUrl = mcpServer.env?.N8N_BASE_URL;
      if (configBaseUrl && configBaseUrl !== this.env.N8N_BASE_URL) {
        this.addIssue('WARNING', 
          `Base URL mismatch: config=${configBaseUrl}, env=${this.env.N8N_BASE_URL}`,
          'Ensure environment variables match config');
      }

      // Check webhook path configuration
      const webhookConfig = config.workflows?.enhanced_video_compilation;
      if (webhookConfig?.webhook_path) {
        const expectedUrl = `${this.env.N8N_BASE_URL.replace('/api', '')}${webhookConfig.webhook_path}`;
        console.log(`📋 Expected webhook URL: ${expectedUrl}`);
        
        this.results.configuration.expectedWebhookUrl = expectedUrl;
        this.results.configuration.webhookPath = webhookConfig.webhook_path;
      }

      this.results.configuration.status = 'VALID';
      console.log('✅ MCP configuration validated');

    } catch (error) {
      this.addIssue('ERROR', `MCP configuration error: ${error.message}`, 'Check config/mcp-config.json file');
      this.results.configuration.status = 'ERROR';
    }
  }

  /**
   * Cross-validate MCP server against actual workflow
   */
  async crossValidate() {
    console.log('\n🔄 Cross-validating MCP Server and Workflow...');

    // Load MCP server configuration
    try {
      const mcpServerPath = path.join(__dirname, 'mcp-server.js');
      const mcpServerContent = await fs.readFile(mcpServerPath, 'utf8');
      
      // Extract webhook URL from MCP server code
      const webhookUrlMatch = mcpServerContent.match(/webhookUrl\s*=\s*['"`]([^'"`]+)['"`]/);
      if (webhookUrlMatch) {
        const mcpWebhookUrl = webhookUrlMatch[1];
        console.log(`🔗 MCP server uses: ${mcpWebhookUrl}`);
        
        if (this.results.webhook.url && this.results.webhook.url !== mcpWebhookUrl) {
          this.addIssue('ERROR', 
            `Webhook URL mismatch: MCP=${mcpWebhookUrl}, Workflow=${this.results.webhook.url}`,
            'Update MCP server webhook URL to match workflow');
        } else {
          console.log('✅ Webhook URLs match');
        }
      }

    } catch (error) {
      this.addIssue('WARNING', `Could not analyze MCP server: ${error.message}`, 'Check scripts/mcp-server.js file');
    }
  }

  /**
   * Add issue to results
   */
  addIssue(severity, message, recommendation) {
    this.results.issues.push({
      severity,
      message,
      recommendation,
      timestamp: new Date().toISOString()
    });

    const icon = {
      'CRITICAL': '🚨',
      'ERROR': '❌',
      'WARNING': '⚠️',
      'INFO': 'ℹ️',
      'SECURITY': '🔒'
    }[severity] || '•';

    console.log(`${icon} ${severity}: ${message}`);
    if (recommendation) {
      console.log(`   💡 ${recommendation}`);
    }
  }

  /**
   * Generate final recommendations
   */
  generateRecommendations() {
    console.log('\n💡 Generating Recommendations...');

    const criticalIssues = this.results.issues.filter(i => i.severity === 'CRITICAL');
    const errorIssues = this.results.issues.filter(i => i.severity === 'ERROR');
    const warningIssues = this.results.issues.filter(i => i.severity === 'WARNING');

    if (criticalIssues.length === 0 && errorIssues.length === 0) {
      this.results.validationStatus = 'PASS';
      console.log('✅ Integration validation PASSED');
    } else if (criticalIssues.length > 0) {
      this.results.validationStatus = 'CRITICAL_FAIL';
      console.log('🚨 Integration validation CRITICAL FAILURE');
    } else {
      this.results.validationStatus = 'FAIL';
      console.log('❌ Integration validation FAILED');
    }

    // Generate action plan
    const actionPlan = [];
    
    if (criticalIssues.length > 0) {
      actionPlan.push('🚨 URGENT: Fix critical issues first');
      criticalIssues.forEach(issue => {
        actionPlan.push(`   • ${issue.recommendation}`);
      });
    }

    if (errorIssues.length > 0) {
      actionPlan.push('❌ Fix errors to enable functionality');
      errorIssues.forEach(issue => {
        actionPlan.push(`   • ${issue.recommendation}`);
      });
    }

    if (warningIssues.length > 0) {
      actionPlan.push('⚠️ Address warnings for optimal performance');
      warningIssues.forEach(issue => {
        actionPlan.push(`   • ${issue.recommendation}`);
      });
    }

    this.results.recommendations = actionPlan;
    
    console.log('\n📋 Action Plan:');
    actionPlan.forEach(action => console.log(action));
  }

  /**
   * Save validation results
   */
  async saveResults() {
    const resultsPath = path.join(__dirname, '..', 'validation-results.json');
    
    try {
      await fs.writeFile(resultsPath, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Validation results saved to: ${resultsPath}`);
    } catch (error) {
      console.error(`❌ Failed to save results: ${error.message}`);
    }
  }

  /**
   * Run full validation
   */
  async runValidation() {
    console.log('🚀 Starting MCP-n8n Integration Validation\n');

    try {
      await this.validateWorkflow();
      await this.validateMCPConfiguration();
      await this.crossValidate();
      
      this.generateRecommendations();
      await this.saveResults();
      
      console.log('\n🎯 Validation Complete!');
      
      return this.results.validationStatus === 'PASS';
      
    } catch (error) {
      console.error(`❌ Validation failed: ${error.message}`);
      this.results.validationStatus = 'ERROR';
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const validator = new MCPIntegrationValidator();
  
  validator.runValidation()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = MCPIntegrationValidator;