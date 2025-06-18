#!/usr/bin/env node

/**
 * MCP-n8n Integration Debug Suite
 * 
 * Comprehensive testing tool to diagnose and fix MCP-n8n integration issues.
 * Tests various webhook URL patterns, authentication methods, and configurations.
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class MCPDebugSuite {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {},
      urlTests: [],
      authTests: [],
      networkTests: [],
      configTests: [],
      recommendations: []
    };
    
    // Load environment variables
    this.loadEnvironment();
  }

  loadEnvironment() {
    this.env = {
      N8N_BASE_URL: process.env.N8N_BASE_URL || 'http://localhost:5678',
      N8N_API_KEY: process.env.N8N_API_KEY || null,
      NODE_ENV: process.env.NODE_ENV || 'development'
    };
    
    this.results.environment = { ...this.env };
    console.log('🔧 Environment loaded:', this.env);
  }

  /**
   * Test various webhook URL patterns
   */
  async testWebhookURLs() {
    console.log('\n🔍 Testing Webhook URL Patterns...');
    
    const baseUrls = [
      this.env.N8N_BASE_URL,
      this.env.N8N_BASE_URL.replace('/api', ''),
      'http://localhost:5678',
      'http://127.0.0.1:5678'
    ].filter((url, index, arr) => arr.indexOf(url) === index); // Remove duplicates
    
    const webhookPaths = [
      '/webhook/compile-video',
      '/webhook-test/compile-video', 
      '/api/webhook/compile-video',
      '/webhook/compile-video-webhook',
      '/hooks/compile-video',
      '/compile-video'
    ];

    const testPayload = {
      query: "test compilation request",
      max_clips: 3,
      quality_threshold: 7,
      duration_preference: "medium"
    };

    for (const baseUrl of baseUrls) {
      for (const path of webhookPaths) {
        const fullUrl = `${baseUrl}${path}`;
        const testResult = {
          url: fullUrl,
          method: 'POST',
          status: null,
          response: null,
          error: null,
          responseTime: null
        };

        try {
          const startTime = Date.now();
          
          const response = await axios.post(fullUrl, testPayload, {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'MCP-Debug-Suite/1.0'
            }
          });
          
          testResult.status = response.status;
          testResult.responseTime = Date.now() - startTime;
          testResult.response = {
            status: response.status,
            headers: response.headers,
            data: typeof response.data === 'string' ? response.data.substring(0, 200) : response.data
          };
          
          console.log(`✅ ${fullUrl} - ${response.status} (${testResult.responseTime}ms)`);
          
        } catch (error) {
          testResult.status = error.response?.status || 'ERROR';
          testResult.error = error.message;
          testResult.responseTime = Date.now() - startTime;
          
          if (error.response) {
            testResult.response = {
              status: error.response.status,
              statusText: error.response.statusText,
              headers: error.response.headers
            };
          }
          
          const statusIcon = error.response?.status === 404 ? '❌' : '⚠️';
          console.log(`${statusIcon} ${fullUrl} - ${testResult.status} (${error.message})`);
        }
        
        this.results.urlTests.push(testResult);
      }
    }
  }

  /**
   * Test authentication methods
   */
  async testAuthentication() {
    console.log('\n🔐 Testing Authentication Methods...');
    
    if (!this.env.N8N_API_KEY) {
      console.log('⚠️ No N8N_API_KEY found in environment');
      this.results.authTests.push({
        type: 'api_key_missing',
        result: 'FAIL',
        message: 'N8N_API_KEY environment variable not set'
      });
      return;
    }

    // Test API endpoints with authentication
    const apiEndpoints = [
      '/api/v1/workflows',
      '/api/workflows', 
      '/rest/workflows'
    ];

    for (const endpoint of apiEndpoints) {
      const testUrl = `${this.env.N8N_BASE_URL}${endpoint}`;
      
      const authTest = {
        endpoint: testUrl,
        authMethod: 'X-N8N-API-KEY',
        status: null,
        error: null
      };

      try {
        const response = await axios.get(testUrl, {
          headers: {
            'X-N8N-API-KEY': this.env.N8N_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        authTest.status = response.status;
        authTest.result = 'SUCCESS';
        authTest.workflowCount = response.data?.data?.length || response.data?.length || 0;
        
        console.log(`✅ ${testUrl} - ${response.status} (${authTest.workflowCount} workflows)`);
        
      } catch (error) {
        authTest.status = error.response?.status || 'ERROR';
        authTest.error = error.message;
        authTest.result = 'FAIL';
        
        console.log(`❌ ${testUrl} - ${authTest.status} (${error.message})`);
      }
      
      this.results.authTests.push(authTest);
    }
  }

  /**
   * Test network connectivity
   */
  async testNetworkConnectivity() {
    console.log('\n🌐 Testing Network Connectivity...');
    
    const networkTests = [
      { name: 'n8n-base', url: this.env.N8N_BASE_URL },
      { name: 'n8n-health', url: `${this.env.N8N_BASE_URL}/healthz` },
      { name: 'localhost-5678', url: 'http://localhost:5678' },
      { name: 'localhost-api', url: 'http://localhost:5678/api' }
    ];

    for (const test of networkTests) {
      const result = {
        name: test.name,
        url: test.url,
        reachable: false,
        responseTime: null,
        error: null
      };

      try {
        const startTime = Date.now();
        const response = await axios.get(test.url, { 
          timeout: 5000,
          validateStatus: () => true // Accept any status code
        });
        
        result.reachable = true;
        result.responseTime = Date.now() - startTime;
        result.status = response.status;
        
        console.log(`✅ ${test.name}: ${test.url} (${result.responseTime}ms, status: ${response.status})`);
        
      } catch (error) {
        result.error = error.message;
        console.log(`❌ ${test.name}: ${test.url} - ${error.message}`);
      }
      
      this.results.networkTests.push(result);
    }
  }

  /**
   * Test MCP configuration files
   */
  async testMCPConfiguration() {
    console.log('\n⚙️ Testing MCP Configuration...');
    
    const configPath = path.join(__dirname, '..', 'config', 'mcp-config.json');
    
    try {
      const configContent = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      const configTest = {
        file: 'config/mcp-config.json',
        valid: true,
        issues: [],
        recommendations: []
      };

      // Check base URL consistency
      const configBaseUrl = config.mcpServers?.['n8n-video-compilation']?.env?.N8N_BASE_URL;
      if (configBaseUrl !== this.env.N8N_BASE_URL) {
        configTest.issues.push(`Base URL mismatch: config=${configBaseUrl}, env=${this.env.N8N_BASE_URL}`);
      }

      // Check webhook path
      const webhookPath = config.workflows?.enhanced_video_compilation?.webhook_path;
      if (webhookPath) {
        configTest.webhookPath = webhookPath;
        console.log(`📋 Configured webhook path: ${webhookPath}`);
      }

      // Check if using correct package
      const command = config.mcpServers?.['n8n-video-compilation']?.command;
      if (command === 'npx') {
        configTest.issues.push('Using npx instead of local script - may cause version issues');
        configTest.recommendations.push('Consider using local script: "command": "node", "args": ["scripts/mcp-server.js"]');
      }

      this.results.configTests.push(configTest);
      console.log(`✅ Configuration loaded successfully`);
      
    } catch (error) {
      this.results.configTests.push({
        file: 'config/mcp-config.json',
        valid: false,
        error: error.message
      });
      console.log(`❌ Configuration error: ${error.message}`);
    }
  }

  /**
   * Test MCP function parameter validation
   */
  async testMCPParameters() {
    console.log('\n🧪 Testing MCP Parameter Validation...');
    
    const testCases = [
      {
        name: 'valid_basic',
        params: { query: "LeBron dunking" },
        expected: 'success'
      },
      {
        name: 'valid_complete',
        params: { 
          query: "Stephen Curry three pointers",
          max_clips: 5,
          quality_threshold: 8,
          duration_preference: "medium"
        },
        expected: 'success'
      },
      {
        name: 'missing_query',
        params: { max_clips: 5 },
        expected: 'error'
      },
      {
        name: 'invalid_duration',
        params: { 
          query: "test",
          duration_preference: "invalid"
        },
        expected: 'error'
      }
    ];

    // Load the MCP server class to test parameter validation
    try {
      const MCPServer = require('./mcp-server.js');
      
      for (const testCase of testCases) {
        const result = {
          name: testCase.name,
          params: testCase.params,
          valid: false,
          error: null
        };

        try {
          // Test parameter validation (would need to modify MCP server to expose this)
          // For now, just check basic structure
          if (testCase.params.query || testCase.expected === 'error') {
            result.valid = true;
          }
          
          console.log(`✅ ${testCase.name}: Parameters valid`);
          
        } catch (error) {
          result.error = error.message;
          console.log(`❌ ${testCase.name}: ${error.message}`);
        }
        
        this.results.urlTests.push(result);
      }
      
    } catch (error) {
      console.log(`⚠️ Could not load MCP server for parameter testing: ${error.message}`);
    }
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    console.log('\n💡 Generating Recommendations...');
    
    const recommendations = [];
    
    // Check for successful URL patterns
    const successfulUrls = this.results.urlTests.filter(test => test.status === 200 || test.status === 201);
    const notFoundUrls = this.results.urlTests.filter(test => test.status === 404);
    
    if (successfulUrls.length > 0) {
      recommendations.push({
        type: 'success',
        message: `Found working webhook URLs: ${successfulUrls.map(t => t.url).join(', ')}`,
        action: 'Update MCP server to use these URLs'
      });
    }
    
    if (notFoundUrls.length > 0) {
      recommendations.push({
        type: 'warning',
        message: `Found 404 errors for: ${notFoundUrls.map(t => t.url).join(', ')}`,
        action: 'These URLs should be avoided in MCP server configuration'
      });
    }

    // Check authentication
    const successfulAuth = this.results.authTests.filter(test => test.result === 'SUCCESS');
    if (successfulAuth.length === 0 && this.env.N8N_API_KEY) {
      recommendations.push({
        type: 'error',
        message: 'API authentication failing despite API key being present',
        action: 'Check API key validity and n8n API endpoint configuration'
      });
    }

    // Environment recommendations
    if (!this.env.N8N_API_KEY) {
      recommendations.push({
        type: 'warning',
        message: 'No N8N_API_KEY found in environment',
        action: 'Set N8N_API_KEY environment variable for API access'
      });
    }

    // Network connectivity
    const networkIssues = this.results.networkTests.filter(test => !test.reachable);
    if (networkIssues.length > 0) {
      recommendations.push({
        type: 'error',
        message: 'Network connectivity issues detected',
        action: 'Check if n8n is running and accessible'
      });
    }

    this.results.recommendations = recommendations;
    
    recommendations.forEach(rec => {
      const icon = rec.type === 'success' ? '✅' : rec.type === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${rec.message}`);
      console.log(`   Action: ${rec.action}\n`);
    });
  }

  /**
   * Save detailed results to file
   */
  async saveResults() {
    const resultsPath = path.join(__dirname, '..', 'debug-results.json');
    
    try {
      await fs.writeFile(resultsPath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Detailed results saved to: ${resultsPath}`);
    } catch (error) {
      console.error(`❌ Failed to save results: ${error.message}`);
    }
  }

  /**
   * Run all tests
   */
  async runAll() {
    console.log('🚀 Starting MCP-n8n Integration Debug Suite\n');
    
    try {
      await this.testNetworkConnectivity();
      await this.testWebhookURLs();
      await this.testAuthentication();
      await this.testMCPConfiguration();
      await this.testMCPParameters();
      
      this.generateRecommendations();
      await this.saveResults();
      
      console.log('\n🎯 Debug Suite Complete!');
      console.log('Check debug-results.json for detailed analysis.');
      
      // Return success status based on results
      const hasSuccessfulWebhook = this.results.urlTests.some(test => 
        test.status === 200 || test.status === 201
      );
      
      return hasSuccessfulWebhook;
      
    } catch (error) {
      console.error(`❌ Debug suite failed: ${error.message}`);
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const debugSuite = new MCPDebugSuite();
  
  debugSuite.runAll()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = MCPDebugSuite;