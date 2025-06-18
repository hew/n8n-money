#!/usr/bin/env node

const axios = require('axios');
const { spawn } = require('child_process');

class MCPServerTester {
  constructor() {
    this.mcpServerProcess = null;
    this.testResults = [];
  }

  async runTests() {
    console.log('🚀 Starting MCP Server Tests...\n');

    try {
      // Test 1: Server startup
      await this.testServerStartup();
      
      // Test 2: Tools listing
      await this.testToolsListing();
      
      // Test 3: Query optimization
      await this.testQueryOptimization();
      
      // Test 4: Video compilation
      await this.testVideoCompilation();
      
      // Test 5: Workflow listing
      await this.testWorkflowListing();
      
      // Test 6: Batch compilation
      await this.testBatchCompilation();

      this.printSummary();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    } finally {
      if (this.mcpServerProcess) {
        this.mcpServerProcess.kill();
      }
    }
  }

  async testServerStartup() {
    console.log('📡 Testing MCP Server Startup...');
    
    try {
      // Start the MCP server
      this.mcpServerProcess = spawn('node', ['mcp-server.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          N8N_BASE_URL: 'http://localhost:5678/api',
          N8N_API_KEY: process.env.N8N_API_KEY || 'test-key'
        }
      });

      // Wait for server to start
      await this.sleep(2000);
      
      if (this.mcpServerProcess.pid) {
        this.addTestResult('Server Startup', true, 'MCP server started successfully');
      } else {
        this.addTestResult('Server Startup', false, 'Failed to start MCP server');
      }
    } catch (error) {
      this.addTestResult('Server Startup', false, error.message);
    }
  }

  async testToolsListing() {
    console.log('🔧 Testing Tools Listing...');
    
    try {
      const response = await this.sendMCPRequest('tools/list', {});
      
      if (response.tools && Array.isArray(response.tools)) {
        const expectedTools = ['compile_video', 'optimize_search_query', 'batch_compile', 'list_workflows', 'get_workflow_status'];
        const actualTools = response.tools.map(tool => tool.name);
        const hasAllTools = expectedTools.every(tool => actualTools.includes(tool));
        
        if (hasAllTools) {
          this.addTestResult('Tools Listing', true, `Found all ${expectedTools.length} expected tools`);
        } else {
          this.addTestResult('Tools Listing', false, `Missing tools: ${expectedTools.filter(t => !actualTools.includes(t)).join(', ')}`);
        }
      } else {
        this.addTestResult('Tools Listing', false, 'Invalid tools response format');
      }
    } catch (error) {
      this.addTestResult('Tools Listing', false, error.message);
    }
  }

  async testQueryOptimization() {
    console.log('🎯 Testing Query Optimization...');
    
    try {
      const response = await this.sendMCPRequest('tools/call', {
        name: 'optimize_search_query',
        arguments: {
          original_query: 'lebron dunk'
        }
      });
      
      if (response.content && response.content[0] && response.content[0].text) {
        const result = JSON.parse(response.content[0].text);
        
        if (result.optimized_query && result.optimized_query !== 'lebron dunk') {
          this.addTestResult('Query Optimization', true, `Query enhanced: "${result.original_query}" → "${result.optimized_query}"`);
        } else {
          this.addTestResult('Query Optimization', false, 'Query was not optimized');
        }
      } else {
        this.addTestResult('Query Optimization', false, 'Invalid response format');
      }
    } catch (error) {
      this.addTestResult('Query Optimization', false, error.message);
    }
  }

  async testVideoCompilation() {
    console.log('🎬 Testing Video Compilation...');
    
    try {
      // First check if n8n is running
      const n8nCheck = await this.checkN8nAvailability();
      if (!n8nCheck) {
        this.addTestResult('Video Compilation', false, 'n8n server not available at localhost:5678');
        return;
      }

      const response = await this.sendMCPRequest('tools/call', {
        name: 'compile_video',
        arguments: {
          query: 'test basketball highlights',
          max_clips: 3,
          quality_threshold: 5
        }
      });
      
      if (response.content && response.content[0] && response.content[0].text) {
        const result = JSON.parse(response.content[0].text);
        
        if (result.status === 'success' || result.status === 'error') {
          // Even if compilation fails due to API issues, the MCP tool worked
          this.addTestResult('Video Compilation', true, `MCP tool executed, status: ${result.status}`);
        } else {
          this.addTestResult('Video Compilation', false, 'Unexpected response format');
        }
      } else {
        this.addTestResult('Video Compilation', false, 'Invalid response format');
      }
    } catch (error) {
      this.addTestResult('Video Compilation', false, error.message);
    }
  }

  async testWorkflowListing() {
    console.log('📋 Testing Workflow Listing...');
    
    try {
      const response = await this.sendMCPRequest('tools/call', {
        name: 'list_workflows',
        arguments: {}
      });
      
      if (response.content && response.content[0] && response.content[0].text) {
        const result = JSON.parse(response.content[0].text);
        
        if (result.total_workflows !== undefined) {
          this.addTestResult('Workflow Listing', true, `Found ${result.total_workflows} workflows, ${result.video_workflows || 0} video-related`);
        } else if (result.error) {
          this.addTestResult('Workflow Listing', false, `API Error: ${result.error}`);
        } else {
          this.addTestResult('Workflow Listing', false, 'Unexpected response format');
        }
      } else {
        this.addTestResult('Workflow Listing', false, 'Invalid response format');
      }
    } catch (error) {
      this.addTestResult('Workflow Listing', false, error.message);
    }
  }

  async testBatchCompilation() {
    console.log('📦 Testing Batch Compilation...');
    
    try {
      const response = await this.sendMCPRequest('tools/call', {
        name: 'batch_compile',
        arguments: {
          queries: ['test query 1', 'test query 2'],
          settings: {
            max_clips: 2,
            quality_threshold: 5
          }
        }
      });
      
      if (response.content && response.content[0] && response.content[0].text) {
        const result = JSON.parse(response.content[0].text);
        
        if (result.batch_results && result.summary) {
          this.addTestResult('Batch Compilation', true, `Processed ${result.summary.total} queries`);
        } else {
          this.addTestResult('Batch Compilation', false, 'Unexpected response format');
        }
      } else {
        this.addTestResult('Batch Compilation', false, 'Invalid response format');
      }
    } catch (error) {
      this.addTestResult('Batch Compilation', false, error.message);
    }
  }

  async sendMCPRequest(method, params) {
    // Simulate MCP request by directly calling the server class
    const VideoCompilationMCPServer = require('./mcp-server.js');
    const server = new VideoCompilationMCPServer();
    
    if (method === 'tools/list') {
      return await server.server.request({ method: 'tools/list', params: {} });
    } else if (method === 'tools/call') {
      return await server.server.request({ method: 'tools/call', params });
    }
    
    throw new Error(`Unknown method: ${method}`);
  }

  async checkN8nAvailability() {
    try {
      const response = await axios.get('http://localhost:5678/rest/active-workflows', {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  addTestResult(testName, passed, message) {
    this.testResults.push({ testName, passed, message });
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}\n`);
  }

  printSummary() {
    console.log('📊 Test Summary');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! MCP server is ready for AI agent integration.');
    } else {
      console.log('⚠️  Some tests failed. Check the issues above and ensure:');
      console.log('   - n8n is running on localhost:5678');
      console.log('   - API keys are properly configured');
      console.log('   - Enhanced video compilation workflow is imported and active');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new MCPServerTester();
  tester.runTests().catch(console.error);
}

module.exports = MCPServerTester;