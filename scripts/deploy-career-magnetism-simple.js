#!/usr/bin/env node

/**
 * AI-Powered Career Opportunity Magnetism System Deployer (Simplified)
 * 
 * Deploy the ultimate technical honey pot that hiring managers can't resist.
 * This system demonstrates your automation expertise while attracting opportunities.
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class SimpleCareerMagnetismDeployer {
  constructor() {
    this.workflowsDir = path.join(__dirname, '..', 'workflows');
    this.env = this.loadEnvironment();
    this.deployedSystems = [];
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
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║           🎯 AI-Powered Career Magnetism System             ║');
    console.log('║        Deploy technical honey pots that attract opportunities   ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log();
  }

  async checkPrerequisites() {
    console.log('Checking system prerequisites...');
    const issues = [];

    // Check n8n connection
    try {
      const response = await axios.get(`${this.env.N8N_BASE_URL}/healthz`, {
        timeout: 5000
      });
      if (response.status !== 200) {
        issues.push('n8n server not responding properly');
      }
    } catch (error) {
      issues.push('n8n server not accessible - make sure n8n is running');
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
      console.log('✅ System prerequisites check passed');
      if (missingOptional.length > 0) {
        console.log(`⚠️  Optional APIs not configured: ${missingOptional.join(', ')}`);
        console.log('   System will work with reduced functionality');
      }
      return true;
    } else {
      console.log('❌ Prerequisites check failed');
      console.log('\n❌ Issues found:');
      issues.forEach(issue => console.log(`   • ${issue}`));
      return false;
    }
  }

  async deployJobIntelligenceDashboard() {
    console.log('🚀 Deploying AI Job Market Intelligence Dashboard...');
    
    try {
      // Load the workflow
      const workflowPath = path.join(this.workflowsDir, 'ai-job-market-intelligence.json');
      
      if (!await fs.pathExists(workflowPath)) {
        throw new Error(`Workflow file not found: ${workflowPath}`);
      }
      
      const workflow = await fs.readJSON(workflowPath);

      // Deploy to n8n
      const response = await axios.post(
        `${this.env.N8N_BASE_URL}/api/v1/workflows`,
        {
          name: workflow.name,
          nodes: workflow.nodes,
          connections: workflow.connections,
          settings: workflow.settings || {},
          staticData: workflow.staticData || {}
        },
        {
          headers: {
            'X-N8N-API-KEY': this.env.N8N_API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.status === 200 || response.status === 201) {
        const workflowId = response.data.id;
        console.log('✅ AI Job Market Intelligence Dashboard deployed successfully');
        
        const webhookUrl = `${this.env.N8N_BASE_URL.replace('/api', '')}/webhook/ai-job-intelligence`;
        
        this.deployedSystems.push({
          name: 'AI Job Market Intelligence Dashboard',
          id: workflowId,
          webhook: webhookUrl,
          description: 'Real-time AI job market analysis that hiring managers desperately need'
        });

        console.log(`   ✓ Workflow ID: ${workflowId}`);
        console.log(`   ✓ Public API: ${webhookUrl}`);
        console.log(`   ✓ Admin Panel: ${this.env.N8N_BASE_URL.replace('/api', '')}/workflow/${workflowId}`);
        
        return true;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Failed to deploy Job Intelligence Dashboard');
      console.log(`   Error: ${error.message}`);
      
      if (error.response?.data) {
        console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      
      return false;
    }
  }

  async generateLandingPage() {
    console.log('📄 Generating marketing landing page...');
    
    try {
      const webhookUrl = this.deployedSystems.find(s => s.name.includes('Intelligence'))?.webhook || 'https://your-n8n.domain/webhook/ai-job-intelligence';
      
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
        .cta { text-align: center; margin: 4rem 0; }
        .cta a { background: #ff6b6b; color: white; padding: 1rem 2rem; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; }
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
        
        <div class="api-demo">
            <h3 style="color: white; margin-bottom: 1rem;">🔗 Live API Access</h3>
            <p style="color: rgba(255,255,255,0.9); margin-bottom: 1rem;">Access real-time data programmatically:</p>
            <div class="code">curl ${webhookUrl}</div>
        </div>
        
        <div class="cta">
            <a href="${webhookUrl}" target="_blank">🚀 Get Live Data Now</a>
        </div>
        
        <div style="text-align: center; color: rgba(255,255,255,0.7); margin-top: 4rem; padding: 2rem;">
            <p>Built with n8n automation platform | Updates every 6 hours</p>
            <p>Powered by AI and real-time data analysis</p>
        </div>
    </div>
</body>
</html>`;

      await fs.writeFile(path.join(__dirname, '..', 'ai-job-intelligence-landing.html'), landingPage);
      
      console.log('✅ Marketing assets generated');
      console.log('   ✓ Landing page: ai-job-intelligence-landing.html');
      
      return true;
    } catch (error) {
      console.log('❌ Failed to generate marketing assets');
      console.log(`   Error: ${error.message}`);
      return false;
    }
  }

  displayDeploymentSummary() {
    console.log('\n🎯 Career Magnetism System - Deployment Summary');
    console.log('═'.repeat(60));
    
    if (this.deployedSystems.length === 0) {
      console.log('⚠️  No systems deployed yet.');
      return;
    }

    this.deployedSystems.forEach(system => {
      console.log(`✅ ${system.name}`);
      console.log(`   🌐 API: ${system.webhook}`);
      console.log(`   ⚙️  Admin: ${this.env.N8N_BASE_URL.replace('/api', '')}/workflow/${system.id}`);
      console.log(`   📝 ${system.description}`);
      console.log();
    });

    console.log('🚀 Next Steps to Maximize Impact:');
    console.log('1. Share the landing page on LinkedIn and Twitter');
    console.log('2. Submit to Product Hunt and Hacker News');
    console.log('3. Create a GitHub repository showcasing the system');
    console.log('4. Write a technical blog post about your approach');
    console.log('5. Monitor API usage to identify interested hiring managers');
    
    console.log('\n⚡ Pro Tips:');
    console.log('• The system tracks user engagement - review analytics daily');
    console.log('• High-engagement users from recruiting domains are prime leads');
    console.log('• Share interesting insights on social media to drive traffic');
    console.log('• Consider adding email capture for deeper engagement');
  }

  async run() {
    this.displayWelcome();
    
    const prerequisitesOk = await this.checkPrerequisites();
    if (!prerequisitesOk) {
      console.log('\n💡 Run "bun run setup:career" to check environment setup');
      process.exit(1);
    }

    console.log('\n🎯 Deploying Strategy #1: Technical Honey Pot');
    console.log('Building AI Job Market Intelligence Dashboard...');
    
    const deployed = await this.deployJobIntelligenceDashboard();
    if (deployed) {
      await this.generateLandingPage();
      this.displayDeploymentSummary();
      
      console.log('\n🎉 SUCCESS! Your AI-powered career magnetism system is now live!');
      console.log('\n📖 Next: Check docs/career-magnetism-master-plan.md for the complete strategic blueprint');
    } else {
      console.log('\n❌ Deployment failed. Please check the errors above and try again.');
    }
  }
}

// Run the deployer
if (require.main === module) {
  const deployer = new SimpleCareerMagnetismDeployer();
  deployer.run().catch(console.error);
}

module.exports = SimpleCareerMagnetismDeployer;