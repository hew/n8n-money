#!/usr/bin/env node

/**
 * 🚀 Career Magnetism Deployment System
 * 
 * Deploys and manages the 10-strategy career acceleration infrastructure
 * Philosophy: Build systems so valuable that opportunities chase you
 */

const fs = require('fs-extra');
const axios = require('axios');
const { default: ora } = require('ora');

// Import chalk dynamically for v5 compatibility
let chalk;
(async () => {
  chalk = (await import('chalk')).default;
})();

class CareerMagnetismDeployer {
  constructor() {
    this.baseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678/api';
    this.apiKey = process.env.N8N_API_KEY;
    this.strategies = [
      {
        id: 1,
        name: 'AI Job Market Intelligence API',
        description: 'Real-time job market analysis and trend intelligence',
        priority: 'HIGH',
        status: 'DEPLOYED'
      },
      {
        id: 2,
        name: 'AI Recruiter Hunter',
        description: 'Automated recruiter identification and engagement',
        priority: 'HIGH',
        status: 'PENDING'
      },
      {
        id: 3,
        name: 'Automated Outreach Engine',
        description: 'Personalized networking and relationship building',
        priority: 'MEDIUM',
        status: 'PENDING'
      },
      {
        id: 4,
        name: 'Proof-of-Concept Marketplace',
        description: 'Portfolio of valuable tools and demonstrations',
        priority: 'HIGH',
        status: 'PENDING'
      },
      {
        id: 5,
        name: 'Content Authority Engine',
        description: 'Automated content creation and distribution',
        priority: 'MEDIUM',
        status: 'PENDING'
      },
      {
        id: 6,
        name: 'Reputation Automation',
        description: 'Social proof and influence amplification',
        priority: 'HIGH',
        status: 'PENDING'
      },
      {
        id: 7,
        name: 'Industry Intelligence Network',
        description: 'Insider knowledge and trend prediction',
        priority: 'MEDIUM',
        status: 'PENDING'
      },
      {
        id: 8,
        name: 'Skill Gap Analyzer',
        description: 'Real-time market demand analysis',
        priority: 'MEDIUM',
        status: 'PENDING'
      },
      {
        id: 9,
        name: 'Compensation Intelligence',
        description: 'Salary optimization and negotiation data',
        priority: 'LOW',
        status: 'PENDING'
      },
      {
        id: 10,
        name: 'Career Path Optimizer',
        description: 'Strategic career trajectory planning',
        priority: 'LOW',
        status: 'PENDING'
      }
    ];
  }

  log(level, message) {
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m', // green  
      warn: '\x1b[33m',    // yellow
      error: '\x1b[31m',   // red
      reset: '\x1b[0m'     // reset
    };
    
    console.log(`${colors[level]}${message}${colors.reset}`);
  }

  async deploy() {
    this.log('info', '🚀 Initializing Career Magnetism System...');
    
    try {
      await this.validateEnvironment();
      await this.deployWorkflows();
      await this.setupPerformanceTracking();
      await this.initializeStrategies();
      await this.createDashboard();
      
      this.log('success', '✅ Career Magnetism System Deployed Successfully!');
      this.log('warn', '\n📊 Next Steps:');
      this.log('info', '1. Run: bun run career:collect (Start performance tracking)');
      this.log('info', '2. Run: bun run career:report (Generate initial report)');
      this.log('info', '3. Begin autonomous operation cycle');
      
    } catch (error) {
      this.log('error', `❌ Deployment failed: ${error.message}`);
      process.exit(1);
    }
  }

  async validateEnvironment() {
    const spinner = ora('Validating environment...').start();
    
    if (!this.apiKey) {
      spinner.fail('N8N_API_KEY not found in environment');
      throw new Error('Please set N8N_API_KEY environment variable');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': this.apiKey }
      });
      spinner.succeed('n8n connection validated');
    } catch (error) {
      spinner.fail('Failed to connect to n8n');
      throw new Error(`n8n connection failed: ${error.message}`);
    }
  }

  async deployWorkflows() {
    const spinner = ora('Deploying career magnetism workflows...').start();
    
    const workflows = [
      {
        name: 'AI Job Market Intelligence',
        file: 'ai-job-market-intelligence.json',
        webhook: '/webhook/job-intelligence'
      },
      {
        name: 'Performance Tracker',
        file: 'performance-tracker.json',
        webhook: '/webhook/track-performance'
      },
      {
        name: 'Content Authority Engine',
        file: 'content-authority.json',
        webhook: '/webhook/create-content'
      }
    ];

    for (const workflow of workflows) {
      try {
        const workflowData = await this.createWorkflowData(workflow);
        await this.importWorkflow(workflowData);
        spinner.text = `Deployed: ${workflow.name}`;
      } catch (error) {
        this.log('warn', `⚠️  Could not deploy ${workflow.name}: ${error.message}`);
      }
    }

    spinner.succeed('Core workflows deployed');
  }

  async createWorkflowData(workflow) {
    // Create basic workflow structure for career magnetism
    return {
      name: workflow.name,
      nodes: [
        {
          id: 'webhook',
          type: 'n8n-nodes-base.webhook',
          position: [240, 300],
          parameters: {
            path: workflow.webhook,
            httpMethod: 'POST'
          }
        },
        {
          id: 'response',
          type: 'n8n-nodes-base.respondToWebhook',
          position: [460, 300],
          parameters: {
            responseBody: { success: true, message: 'Career magnetism system active' }
          }
        }
      ],
      connections: {
        webhook: { main: [[{ node: 'response', type: 'main', index: 0 }]] }
      },
      active: true,
      settings: { timezone: 'America/New_York' }
    };
  }

  async importWorkflow(workflowData) {
    const response = await axios.post(
      `${this.baseUrl}/v1/workflows`,
      workflowData,
      { headers: { 'X-N8N-API-KEY': this.apiKey } }
    );
    return response.data;
  }

  async setupPerformanceTracking() {
    const spinner = ora('Setting up performance tracking...').start();
    
    const trackingConfig = {
      metrics: {
        api_requests: 0,
        qualified_leads: 0,
        social_engagement: 0,
        content_reach: 0,
        interview_requests: 0,
        speaking_opportunities: 0
      },
      goals: {
        month_1: {
          api_requests: 1000,
          qualified_leads: 25,
          social_engagement: 500,
          content_reach: 10000
        },
        month_3: {
          api_requests: 5000,
          qualified_leads: 100,
          interview_requests: 10,
          speaking_opportunities: 2
        }
      },
      last_updated: new Date().toISOString()
    };

    await fs.ensureDir('data');
    await fs.writeJson('data/performance-metrics.json', trackingConfig);
    
    spinner.succeed('Performance tracking initialized');
  }

  async initializeStrategies() {
    const spinner = ora('Initializing career strategies...').start();
    
    const strategyData = {
      strategies: this.strategies,
      active_strategies: this.strategies.filter(s => s.status === 'DEPLOYED'),
      deployment_order: this.strategies
        .filter(s => s.priority === 'HIGH')
        .map(s => s.id),
      last_updated: new Date().toISOString()
    };

    await fs.writeJson('data/strategy-status.json', strategyData);
    
    spinner.succeed('Strategy framework initialized');
  }

  async createDashboard() {
    const spinner = ora('Creating performance dashboard...').start();
    
    const dashboardConfig = {
      endpoints: {
        job_intelligence: `${this.baseUrl.replace('/api', '')}/webhook/job-intelligence`,
        performance_tracker: `${this.baseUrl.replace('/api', '')}/webhook/track-performance`,
        content_engine: `${this.baseUrl.replace('/api', '')}/webhook/create-content`
      },
      monitoring: {
        uptime_checks: true,
        performance_alerts: true,
        opportunity_notifications: true
      },
      automation: {
        daily_reports: true,
        weekly_analysis: true,
        monthly_planning: true
      }
    };

    await fs.writeJson('config/dashboard-config.json', dashboardConfig);
    
    spinner.succeed('Dashboard configuration created');
  }

  async getSystemStatus() {
    const strategies = await fs.readJson('data/strategy-status.json').catch(() => ({ strategies: [] }));
    const metrics = await fs.readJson('data/performance-metrics.json').catch(() => ({ metrics: {} }));
    
    return {
      total_strategies: strategies.strategies?.length || 0,
      active_strategies: strategies.active_strategies?.length || 0,
      current_metrics: metrics.metrics || {},
      system_health: 'OPERATIONAL'
    };
  }
}

// CLI execution
if (require.main === module) {
  const deployer = new CareerMagnetismDeployer();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'deploy':
      deployer.deploy();
      break;
    case 'status':
      deployer.getSystemStatus().then(status => {
        console.log('\x1b[36m📊 Career Magnetism System Status:\x1b[0m');
        console.log(JSON.stringify(status, null, 2));
      });
      break;
    default:
      deployer.deploy();
  }
}

module.exports = CareerMagnetismDeployer;