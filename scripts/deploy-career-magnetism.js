#!/usr/bin/env node

/**
 * AI-Powered Career Opportunity Magnetism System Deployer
 * 
 * Deploy the ultimate technical honey pot that hiring managers can't resist.
 * This system demonstrates your automation expertise while attracting opportunities.
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const ora = require('ora').default || require('ora');

// Import chalk with proper ES module handling
let chalk;
(async () => {
  try {
    chalk = (await import('chalk')).default;
  } catch (error) {
    // Fallback for older chalk versions or if import fails
    try {
      chalk = require('chalk');
    } catch (e) {
      // Ultimate fallback - create mock chalk functions
      chalk = {
        cyan: (text) => `\x1b[36m${text}\x1b[0m`,
        green: (text) => `\x1b[32m${text}\x1b[0m`,
        red: (text) => `\x1b[31m${text}\x1b[0m`,
        yellow: (text) => `\x1b[33m${text}\x1b[0m`,
        blue: (text) => `\x1b[34m${text}\x1b[0m`,
        gray: (text) => `\x1b[90m${text}\x1b[0m`,
        white: (text) => `\x1b[37m${text}\x1b[0m`,
        bold: {
          white: (text) => `\x1b[1m\x1b[37m${text}\x1b[0m`,
          cyan: (text) => `\x1b[1m\x1b[36m${text}\x1b[0m`,
          yellow: (text) => `\x1b[1m\x1b[33m${text}\x1b[0m`
        }
      };
    }
  }
})();

// Ensure chalk is available synchronously
const createChalkFallback = () => ({
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
  white: (text) => `\x1b[37m${text}\x1b[0m`,
  bold: {
    white: (text) => `\x1b[1m\x1b[37m${text}\x1b[0m`,
    cyan: (text) => `\x1b[1m\x1b[36m${text}\x1b[0m`,
    yellow: (text) => `\x1b[1m\x1b[33m${text}\x1b[0m`
  }
});

class CareerMagnetismDeployer {
  constructor() {
    this.workflowsDir = path.join(__dirname, '..', 'workflows');
    this.env = this.loadEnvironment();
    this.deployedSystems = [];
    this.chalk = chalk || createChalkFallback();
  }

  loadEnvironment() {
    return {
      N8N_BASE_URL: process.env.N8N_BASE_URL || 'http://localhost:5678',
      N8N_API_KEY: process.env.N8N_API_KEY,
      ADZUNA_APP_ID: process.env.ADZUNA_APP_ID,
      ADZUNA_API_KEY: process.env.ADZUNA_API_KEY,
      SERPAPI_KEY: process.env.SERPAPI_KEY,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
      TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN
    };
  }

  displayWelcome() {
    console.clear();
    console.log(this.chalk.cyan('╔═══════════════════════════════════════════════════════════════╗'));
    console.log(this.chalk.cyan('║') + (this.chalk.bold?.white || this.chalk.white)('           🎯 AI-Powered Career Magnetism System             ') + this.chalk.cyan('║'));
    console.log(this.chalk.cyan('║') + this.chalk.gray('        Deploy technical honey pots that attract opportunities   ') + this.chalk.cyan('║'));
    console.log(this.chalk.cyan('╚═══════════════════════════════════════════════════════════════╝'));
    console.log();
  }

  async checkPrerequisites() {
    const spinner = ora('Checking system prerequisites...').start();
    const issues = [];

    // Check n8n connection
    try {
      const response = await axios.get(`${this.env.N8N_BASE_URL}/healthz`, {
        timeout: 5000
      });
      if (response.status !== 200) {
        issues.push('n8n server not responding');
      }
    } catch (error) {
      issues.push('n8n server not accessible');
    }

    // Check required environment variables
    const requiredEnvs = ['N8N_API_KEY'];
    const optionalEnvs = ['ADZUNA_APP_ID', 'ADZUNA_API_KEY', 'SERPAPI_KEY', 'GITHUB_TOKEN'];
    
    requiredEnvs.forEach(env => {
      if (!this.env[env]) {
        issues.push(`Missing required environment variable: ${env}`);
      }
    });

    const missingOptional = optionalEnvs.filter(env => !this.env[env]);
    
    if (issues.length === 0) {
      spinner.succeed('System prerequisites check passed');
      if (missingOptional.length > 0) {
        console.log(this.chalk.yellow(`⚠️  Optional APIs not configured: ${missingOptional.join(', ')}`));
        console.log(this.chalk.gray('   System will work with reduced functionality'));
      }
    } else {
      spinner.fail('Prerequisites check failed');
      console.log(this.chalk.red('\n❌ Issues found:'));
      issues.forEach(issue => console.log(this.chalk.red(`   • ${issue}`)));
      return false;
    }

    return true;
  }

  async deployJobIntelligenceDashboard() {
    const spinner = ora('Deploying AI Job Market Intelligence Dashboard...').start();
    
    try {
      // Load the workflow
      const workflowPath = path.join(this.workflowsDir, 'ai-job-market-intelligence.json');
      const workflow = await fs.readJSON(workflowPath);

      // Deploy to n8n
      const response = await axios.post(
        `${this.env.N8N_BASE_URL}/api/v1/workflows`,
        {
          name: workflow.name,
          nodes: workflow.nodes,
          connections: workflow.connections,
          settings: workflow.settings,
          staticData: workflow.staticData
        },
        {
          headers: {
            'X-N8N-API-KEY': this.env.N8N_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        const workflowId = response.data.id;
        spinner.succeed('AI Job Market Intelligence Dashboard deployed successfully');
        
        const webhookUrl = `${this.env.N8N_BASE_URL.replace('/api', '')}/webhook/ai-job-intelligence`;
        
        this.deployedSystems.push({
          name: 'AI Job Market Intelligence Dashboard',
          id: workflowId,
          webhook: webhookUrl,
          description: 'Real-time AI job market analysis that hiring managers desperately need'
        });

        console.log(this.chalk.green(`   ✓ Workflow ID: ${workflowId}`));
        console.log(this.chalk.blue(`   ✓ Public API: ${webhookUrl}`));
        console.log(this.chalk.yellow(`   ✓ Admin Panel: ${this.env.N8N_BASE_URL.replace('/api', '')}/workflow/${workflowId}`));
        
        return true;
      }
    } catch (error) {
      spinner.fail('Failed to deploy Job Intelligence Dashboard');
      console.log(this.chalk.red(`   Error: ${error.message}`));
      return false;
    }
  }

  async setupAPICredentials() {
    console.log(this.chalk.bold('\n🔐 API Credentials Setup Guide:'));
    console.log();
    
    const apis = [
      {
        name: 'Adzuna Jobs API',
        url: 'https://developer.adzuna.com',
        env: ['ADZUNA_APP_ID', 'ADZUNA_API_KEY'],
        description: 'Free tier: 1000 requests/month for job data',
        required: 'Recommended'
      },
      {
        name: 'SerpAPI',
        url: 'https://serpapi.com',
        env: ['SERPAPI_KEY'],
        description: 'Free tier: 100 searches/month for Google Jobs',
        required: 'Recommended'
      },
      {
        name: 'GitHub API',
        url: 'https://github.com/settings/tokens',
        env: ['GITHUB_TOKEN'],
        description: 'For publishing reports as public gists',
        required: 'Optional'
      },
      {
        name: 'Slack Webhook',
        url: 'https://api.slack.com/incoming-webhooks',
        env: ['SLACK_WEBHOOK_URL'],
        description: 'For notifications to your Slack workspace',
        required: 'Optional'
      }
    ];

    apis.forEach(api => {
      const status = api.env.every(env => this.env[env]) ? 
        this.chalk.green('✓ Configured') : 
        this.chalk.yellow('⚠ Not configured');
      
      console.log(`${status} ${this.chalk.bold(api.name)}`);
      console.log(`   ${this.chalk.gray('└─')} ${api.description}`);
      console.log(`   ${this.chalk.gray('└─')} Environment: ${api.env.join(', ')}`);
      console.log(`   ${this.chalk.gray('└─')} Setup: ${api.url}`);
      console.log();
    });
  }

  async generateMarketingAssets() {
    const spinner = ora('Generating marketing assets...').start();
    
    try {
      // Create a landing page for the intelligence dashboard
      const landingPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Job Market Intelligence - Real-time Career Insights</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .hero { text-align: center; color: white; padding: 4rem 0; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 300; }
        .hero p { font-size: 1.2rem; opacity: 0.9; max-width: 600px; margin: 0 auto; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 4rem 0; }
        .feature { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .feature h3 { color: #333; margin-bottom: 1rem; }
        .cta { text-align: center; margin: 4rem 0; }
        .cta a { background: #ff6b6b; color: white; padding: 1rem 2rem; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; transition: transform 0.2s; }
        .cta a:hover { transform: translateY(-2px); }
        .api-demo { background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 12px; margin: 2rem 0; }
        .code { background: #1e1e1e; color: #fff; padding: 1rem; border-radius: 6px; overflow-x: auto; font-family: 'Monaco', monospace; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>🧠 AI Job Market Intelligence</h1>
            <p>Real-time analysis of AI and automation job opportunities. Get the insights hiring managers use to make critical decisions.</p>
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>📊 Real-time Market Data</h3>
                <p>Live analysis of job postings from multiple sources updated every 6 hours. Track salary trends, skill demands, and hiring patterns.</p>
            </div>
            <div class="feature">
                <h3>💰 Salary Intelligence</h3>
                <p>Detailed salary breakdown by percentile, location, and skill set. Know exactly what you're worth in the current market.</p>
            </div>
            <div class="feature">
                <h3>🔥 Skill Trend Analysis</h3>
                <p>Identify the hottest skills in demand. See which technologies are trending up and which are declining.</p>
            </div>
            <div class="feature">
                <h3>🏢 Company Intelligence</h3>
                <p>Track which companies are hiring most aggressively in AI/automation space. Get the inside scoop on market leaders.</p>
            </div>
            <div class="feature">
                <h3>🌍 Geographic Insights</h3>
                <p>Find the best locations for AI/automation careers. Remote work trends and geographic hotspots.</p>
            </div>
            <div class="feature">
                <h3>🤖 AI-Powered Analysis</h3>
                <p>Advanced algorithms analyze job descriptions to extract meaningful insights about market conditions.</p>
            </div>
        </div>
        
        <div class="api-demo">
            <h3 style="color: white; margin-bottom: 1rem;">🔗 Live API Access</h3>
            <p style="color: rgba(255,255,255,0.9); margin-bottom: 1rem;">Access real-time data programmatically:</p>
            <div class="code">
curl ${this.deployedSystems.find(s => s.name.includes('Intelligence'))?.webhook || 'https://your-n8n.domain/webhook/ai-job-intelligence'}
            </div>
        </div>
        
        <div class="cta">
            <a href="${this.deployedSystems.find(s => s.name.includes('Intelligence'))?.webhook || '#'}" target="_blank">
                🚀 Get Live Data Now
            </a>
        </div>
        
        <div style="text-align: center; color: rgba(255,255,255,0.7); margin-top: 4rem; padding: 2rem;">
            <p>Built with n8n automation platform | Updates every 6 hours</p>
            <p>Powered by AI and real-time data analysis</p>
        </div>
    </div>
</body>
</html>`;

      await fs.writeFile(path.join(__dirname, '..', 'ai-job-intelligence-landing.html'), landingPage);
      
      spinner.succeed('Marketing assets generated');
      console.log(this.chalk.green('   ✓ Landing page: ai-job-intelligence-landing.html'));
      
    } catch (error) {
      spinner.fail('Failed to generate marketing assets');
      console.log(this.chalk.red(`   Error: ${error.message}`));
    }
  }

  async displayDeploymentSummary() {
    console.log(this.chalk.bold('\n🎯 Career Magnetism System - Deployment Summary'));
    console.log(this.chalk.gray('═'.repeat(60)));
    
    if (this.deployedSystems.length === 0) {
      console.log(this.chalk.yellow('No systems deployed yet.'));
      return;
    }

    this.deployedSystems.forEach(system => {
      console.log(this.chalk.green(`✅ ${system.name}`));
      console.log(this.chalk.blue(`   🌐 API: ${system.webhook}`));
      console.log(this.chalk.yellow(`   ⚙️  Admin: ${this.env.N8N_BASE_URL.replace('/api', '')}/workflow/${system.id}`));
      console.log(this.chalk.gray(`   📝 ${system.description}`));
      console.log();
    });

    console.log(this.chalk.bold.cyan('\n🚀 Next Steps to Maximize Impact:'));
    console.log(this.chalk.white('1. Share the landing page on LinkedIn and Twitter'));
    console.log(this.chalk.white('2. Submit to Product Hunt and Hacker News'));
    console.log(this.chalk.white('3. Create a GitHub repository showcasing the system'));
    console.log(this.chalk.white('4. Write a technical blog post about your approach'));
    console.log(this.chalk.white('5. Monitor API usage to identify interested hiring managers'));
    
    console.log(this.chalk.bold.yellow('\n⚡ Pro Tips:'));
    console.log(this.chalk.gray('• The system tracks user engagement - review analytics daily'));
    console.log(this.chalk.gray('• High-engagement users from recruiting domains are prime leads'));
    console.log(this.chalk.gray('• Share interesting insights on social media to drive traffic'));
    console.log(this.chalk.gray('• Consider adding email capture for deeper engagement'));
  }

  async run() {
    this.displayWelcome();
    
    const prerequisitesOk = await this.checkPrerequisites();
    if (!prerequisitesOk) {
      process.exit(1);
    }

    console.log(this.chalk.bold('\n🎯 Deploying Strategy #1: Technical Honey Pot'));
    console.log(this.chalk.gray('Building AI Job Market Intelligence Dashboard...'));
    
    const deployed = await this.deployJobIntelligenceDashboard();
    if (deployed) {
      await this.generateMarketingAssets();
      await this.setupAPICredentials();
      await this.displayDeploymentSummary();
    }
  }
}

// Run the deployer
if (require.main === module) {
  const deployer = new CareerMagnetismDeployer();
  deployer.run().catch(console.error);
}

module.exports = CareerMagnetismDeployer;