#!/bin/bash

echo "🚀 Starting AI-Powered Video Compilation MCP Demo"
echo "=================================================="
echo ""

# Check if n8n is running
echo "🔍 Checking n8n availability..."
if curl -s http://localhost:5678/rest/active-workflows > /dev/null 2>&1; then
    echo "✅ n8n is running on localhost:5678"
else
    echo "❌ n8n is not running. Please start n8n first:"
    echo "   bunx n8n"
    echo ""
    exit 1
fi

# Check if enhanced workflow is imported
echo "🔍 Checking for enhanced video compilation workflow..."
echo "   Make sure you've imported: video-compilation-workflow-enhanced.json"
echo ""

# Check dependencies
echo "🔍 Checking MCP dependencies..."
if [ -d "node_modules/@modelcontextprotocol" ]; then
    echo "✅ MCP SDK installed"
else
    echo "❌ MCP SDK not found. Installing..."
    npm install @modelcontextprotocol/sdk axios
fi

echo ""
echo "🎬 MCP Server Features:"
echo "======================"
echo "• compile_video - Create AI-enhanced video compilations"
echo "• optimize_search_query - Smart query optimization"
echo "• batch_compile - Multiple compilations at once"
echo "• list_workflows - View available workflows"
echo "• get_workflow_status - Monitor workflow execution"
echo ""

echo "🤖 AI Agent Integration:"
echo "========================"
echo "For Claude Desktop, add to your config:"
echo ""
echo '{'
echo '  "mcpServers": {'
echo '    "n8n-video-compilation": {'
echo '      "command": "node",'
echo '      "args": ["'$(pwd)'/mcp-server.js"],'
echo '      "env": {'
echo '        "N8N_BASE_URL": "http://localhost:5678/api",'
echo '        "N8N_API_KEY": "your_api_key"'
echo '      }'
echo '    }'
echo '  }'
echo '}'
echo ""

echo "💬 Example AI Prompts:"
echo "======================"
echo '• "Create a compilation of LeBron James dunking highlights"'
echo '• "Optimize the search query: curry three pointers"'
echo '• "Make compilations for top 5 NBA players signature moves"'
echo '• "List all available video workflows"'
echo ""

echo "🚀 Starting MCP Server..."
echo "========================"
echo "Server will run on stdio for AI agent communication"
echo "Press Ctrl+C to stop"
echo ""

# Set environment variables
export N8N_BASE_URL="http://localhost:5678/api"
export N8N_API_KEY="${N8N_API_KEY:-demo-key}"

# Start the MCP server
node mcp-server.js 