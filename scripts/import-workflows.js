#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_KEY) {
    console.error('❌ N8N_API_KEY environment variable is not set');
    process.exit(1);
}

// Function to make HTTP requests
async function makeRequest(url, options = {}) {
    const fetch = (await import('node-fetch')).default;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': N8N_API_KEY,
        },
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, finalOptions);
        const text = await response.text();
        
        // Try to parse as JSON, fallback to text if it fails
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
        
        return {
            ok: response.ok,
            status: response.status,
            data,
            response
        };
    } catch (error) {
        console.error('Request failed:', error.message);
        throw error;
    }
}

// Function to test API connection
async function testConnection() {
    console.log('🔍 Testing n8n API connection...');
    
    // Try different endpoints to find the right one
    const endpoints = [
        '/api/workflows',
        '/rest/workflows', 
        '/api/v1/workflows'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const result = await makeRequest(`${N8N_BASE_URL}${endpoint}`);
            if (result.ok) {
                console.log(`✅ API connection successful via ${endpoint}`);
                return endpoint;
            } else {
                console.log(`❌ ${endpoint}: ${result.status} - ${JSON.stringify(result.data)}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
        }
    }
    
    throw new Error('Could not establish API connection to n8n');
}

// Function to import a workflow
async function importWorkflow(workflowPath, readEndpoint) {
    console.log(`📁 Reading workflow: ${workflowPath}`);
    
    if (!fs.existsSync(workflowPath)) {
        throw new Error(`Workflow file not found: ${workflowPath}`);
    }
    
    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    console.log(`📤 Importing workflow: ${workflowData.name}`);
    
    // Try different endpoints for workflow creation/import
    const createEndpoints = [
        '/rest/workflows/import',
        '/api/workflows/import',
        '/rest/workflows',
        '/api/workflows', 
        '/api/v1/workflows',
        '/api/workflow',
        '/rest/workflow'
    ];
    
    // Prepare workflow data for import
    const importData = {
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections || {},
        settings: workflowData.settings || {},
        staticData: workflowData.staticData || {}
    };
    
    for (const endpoint of createEndpoints) {
        try {
            console.log(`   Trying endpoint: ${endpoint}`);
            const result = await makeRequest(`${N8N_BASE_URL}${endpoint}`, {
                method: 'POST',
                body: JSON.stringify(importData)
            });
            
            if (result.ok) {
                console.log(`✅ Successfully imported: ${workflowData.name} via ${endpoint}`);
                console.log(`   Workflow ID: ${result.data.id || 'N/A'}`);
                return result.data;
            } else {
                console.log(`   ❌ ${endpoint}: ${result.status} - ${typeof result.data === 'string' ? result.data.substring(0, 100) + '...' : JSON.stringify(result.data)}`);
            }
        } catch (error) {
            console.log(`   ❌ ${endpoint}: ${error.message}`);
        }
    }
    
    throw new Error(`Import failed for ${workflowData.name} - no working endpoint found`);
}

// Function to list existing workflows
async function listWorkflows(apiEndpoint) {
    console.log('📋 Listing existing workflows...');
    
    const result = await makeRequest(`${N8N_BASE_URL}${apiEndpoint}`);
    
    if (result.ok) {
        const workflows = Array.isArray(result.data) ? result.data : result.data.data || [];
        console.log(`   Found ${workflows.length} existing workflows`);
        workflows.forEach(w => {
            console.log(`   - ${w.name} (ID: ${w.id}, Active: ${w.active})`);
        });
        return workflows;
    } else {
        console.error('Failed to list workflows:', result.data);
        return [];
    }
}

// Main function
async function main() {
    try {
        console.log('🚀 Starting n8n workflow import...');
        console.log(`   n8n URL: ${N8N_BASE_URL}`);
        console.log(`   API Key: ${N8N_API_KEY.substring(0, 8)}...`);
        
        // Test connection and find the right endpoint
        const apiEndpoint = await testConnection();
        
        // List existing workflows
        await listWorkflows(apiEndpoint);
        
        // Import workflows
        const workflowFiles = [
            './workflows/insurance-claims-workflow.json',
            './workflows/video-generation-workflow.json',
            './workflows/stock-analysis-workflow.json'
        ];
        
        const importedWorkflows = [];
        
        for (const workflowFile of workflowFiles) {
            try {
                const imported = await importWorkflow(workflowFile, apiEndpoint);
                importedWorkflows.push(imported);
            } catch (error) {
                console.error(`Failed to import ${workflowFile}:`, error.message);
            }
        }
        
        console.log('\n🎉 Import process completed!');
        console.log(`   Successfully imported: ${importedWorkflows.length} workflows`);
        
        if (importedWorkflows.length > 0) {
            console.log('\n💡 Next steps:');
            console.log('   1. Check your n8n interface to verify the workflows');
            console.log('   2. Activate the workflows if needed');
            console.log('   3. Test the MCP server connection');
        }
        
    } catch (error) {
        console.error('\n💥 Import failed:', error.message);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the main function
main(); 