#!/usr/bin/env node

/**
 * Environment Setup Script for Career Magnetism System
 * 
 * Helps configure environment variables and API keys needed for the system to work.
 */

const fs = require('fs-extra');
const path = require('path');

console.log('🎯 AI-Powered Career Magnetism System - Environment Setup');
console.log('═'.repeat(60));
console.log();

// Check if n8n is running
console.log('📋 Environment Variables Needed:');
console.log();

const requiredEnvs = [
  {
    name: 'N8N_API_KEY',
    description: 'Your n8n API key (required)',
    instruction: 'Get from n8n Settings > API Keys or use JWT token',
    required: true
  },
  {
    name: 'N8N_BASE_URL',
    description: 'Your n8n instance URL',
    instruction: 'Usually http://localhost:5678 for local development',
    default: 'http://localhost:5678',
    required: true
  }
];

const optionalEnvs = [
  {
    name: 'ADZUNA_APP_ID',
    description: 'Adzuna Jobs API App ID',
    instruction: 'Get free API key from https://developer.adzuna.com',
    required: false
  },
  {
    name: 'ADZUNA_API_KEY',
    description: 'Adzuna Jobs API Key',
    instruction: 'Get free API key from https://developer.adzuna.com',
    required: false
  },
  {
    name: 'SERPAPI_KEY',
    description: 'SerpAPI Key for Google Jobs',
    instruction: 'Get free API key from https://serpapi.com',
    required: false
  },
  {
    name: 'GITHUB_TOKEN',
    description: 'GitHub Personal Access Token',
    instruction: 'Get from https://github.com/settings/tokens',
    required: false
  },
  {
    name: 'SLACK_WEBHOOK_URL',
    description: 'Slack Webhook URL',
    instruction: 'Get from https://api.slack.com/incoming-webhooks',
    required: false
  }
];

// Display required environment variables
console.log('🔴 REQUIRED:');
requiredEnvs.forEach(env => {
  const status = process.env[env.name] ? '✅ Set' : '❌ Missing';
  console.log(`${status} ${env.name}`);
  console.log(`   ${env.description}`);
  console.log(`   ${env.instruction}`);
  if (env.default) {
    console.log(`   Default: ${env.default}`);
  }
  console.log();
});

console.log('🟡 OPTIONAL (for enhanced functionality):');
optionalEnvs.forEach(env => {
  const status = process.env[env.name] ? '✅ Set' : '⚠️  Not set';
  console.log(`${status} ${env.name}`);
  console.log(`   ${env.description}`);
  console.log(`   ${env.instruction}`);
  console.log();
});

// Check if we can proceed
const missingRequired = requiredEnvs.filter(env => !process.env[env.name]);
const missingOptional = optionalEnvs.filter(env => !process.env[env.name]);

console.log('📊 STATUS SUMMARY:');
console.log(`Required variables: ${requiredEnvs.length - missingRequired.length}/${requiredEnvs.length} configured`);
console.log(`Optional variables: ${optionalEnvs.length - missingOptional.length}/${optionalEnvs.length} configured`);
console.log();

if (missingRequired.length > 0) {
  console.log('❌ CANNOT PROCEED - Missing required environment variables:');
  missingRequired.forEach(env => console.log(`   • ${env.name}`));
  console.log();
  console.log('💡 To set environment variables:');
  console.log('   1. Create a .env file in your project root');
  console.log('   2. Add the variables like: N8N_API_KEY=your_key_here');
  console.log('   3. Or export them in your shell: export N8N_API_KEY=your_key_here');
  console.log();
  process.exit(1);
} else {
  console.log('✅ READY TO DEPLOY - All required variables are set!');
  console.log();
  console.log('🚀 Next step: bun run scripts/deploy-career-magnetism.js');
  console.log();
  
  if (missingOptional.length > 0) {
    console.log('💡 For enhanced functionality, consider setting these optional variables:');
    missingOptional.forEach(env => console.log(`   • ${env.name}`));
    console.log();
  }
}