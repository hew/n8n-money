# MCP Integration Guide: AI-Powered Video Compilation

This guide explains how to integrate the Model Context Protocol (MCP) server with your video compilation workflows, enabling AI agents to intelligently manage and optimize video creation.

## Overview

The MCP integration provides AI agents with direct access to your n8n video compilation workflows through a standardized protocol. This enables:

- **Intelligent Query Optimization**: AI automatically enhances search terms
- **Quality Analysis**: Real-time assessment of compilation results
- **Batch Processing**: Automated handling of multiple compilation requests
- **Error Recovery**: Smart retry logic with parameter adjustments
- **Workflow Orchestration**: Seamless integration with other AI tools

## Architecture

```
AI Agent (Claude/GPT) 
    ↓ (MCP Protocol)
MCP Server (mcp-server.js)
    ↓ (HTTP/Webhook)
n8n Workflow (Enhanced Video Compilation)
    ↓ (API Calls)
YouTube API + OpenAI API
    ↓ (Downloads)
Video Files + Compilation
```

## Setup Instructions

### 1. Prerequisites

Ensure you have:
- ✅ n8n running on localhost:5678
- ✅ Enhanced video compilation workflow imported and active
- ✅ YouTube Data API v3 enabled and configured
- ✅ OpenAI API key for content analysis
- ✅ Node.js v14+ installed

### 2. Install Dependencies

```bash
# Install MCP SDK and dependencies
npm install @modelcontextprotocol/sdk axios

# Install the n8n MCP server package
npm install @dopehunter/n8n-mcp-server
```

### 3. Configure Environment

Create a `.env` file with your API keys:

```bash
# n8n Configuration
N8N_BASE_URL=http://localhost:5678/api
N8N_API_KEY=your_n8n_api_key_here

# YouTube API
YOUTUBE_API_KEY=AIzaSyDvMr42Pg97RPksm_jNMORO4LHUAolkGyE

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Start the MCP Server

```bash
# Start the custom MCP server
npm run start:mcp

# Or run directly
node mcp-server.js
```

## AI Agent Configuration

### For Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "n8n-video-compilation": {
      "command": "node",
      "args": ["/path/to/your/project/mcp-server.js"],
      "env": {
        "N8N_BASE_URL": "http://localhost:5678/api",
        "N8N_API_KEY": "your_n8n_api_key"
      }
    }
  }
}
```

### For Other AI Agents

Use the MCP configuration file (`mcp-config.json`) provided in the project.

## Available MCP Tools

### 1. `compile_video`
Create an AI-enhanced video compilation from a search query.

**Parameters:**
- `query` (required): Search query (e.g., "LeBron dunking")
- `max_clips` (optional): Maximum clips (default: 5)
- `quality_threshold` (optional): AI score threshold 1-10 (default: 7)
- `duration_preference` (optional): "short", "medium", or "long" (default: "medium")

**Example:**
```json
{
  "query": "Curry three pointers",
  "max_clips": 7,
  "quality_threshold": 8,
  "duration_preference": "medium"
}
```

### 2. `optimize_search_query`
AI-powered optimization of video search queries.

**Parameters:**
- `original_query` (required): Query to optimize
- `previous_results` (optional): Previous results for learning

**Example:**
```json
{
  "original_query": "lebron dunk",
  "previous_results": []
}
```

### 3. `batch_compile`
Create multiple video compilations in batch.

**Parameters:**
- `queries` (required): Array of search queries
- `settings` (optional): Global settings for all compilations

**Example:**
```json
{
  "queries": [
    "LeBron dunking",
    "Curry three pointers", 
    "Giannis blocks"
  ],
  "settings": {
    "max_clips": 5,
    "quality_threshold": 7
  }
}
```

### 4. `list_workflows`
List all available n8n workflows.

### 5. `get_workflow_status`
Get the status of a specific workflow.

## AI Agent Usage Examples

### Basic Video Compilation

**AI Prompt:**
> "Create a video compilation of LeBron James dunking highlights"

**MCP Tool Call:**
```json
{
  "tool": "compile_video",
  "arguments": {
    "query": "LeBron James dunking highlights"
  }
}
```

### Advanced Compilation with Optimization

**AI Prompt:**
> "Create a high-quality compilation of Stephen Curry three-pointers, but first optimize the search query for better results"

**MCP Tool Calls:**
1. `optimize_search_query` with "Curry three pointers"
2. `compile_video` with optimized query and `quality_threshold: 8`

### Batch Processing

**AI Prompt:**
> "Create compilations for the top 5 NBA players' signature moves"

**MCP Tool Call:**
```json
{
  "tool": "batch_compile",
  "arguments": {
    "queries": [
      "LeBron James dunking",
      "Stephen Curry three pointers",
      "Giannis Antetokounmpo blocks", 
      "Kevin Durant pull-up jumpers",
      "Kawhi Leonard steals"
    ]
  }
}
```

## AI Enhancement Features

### 1. Intelligent Query Optimization
The MCP server automatically enhances search queries:
- **Player Recognition**: "lebron" → "LeBron James"
- **Action Enhancement**: "dunk" → "dunks compilation highlights"
- **Context Addition**: Adds "NBA", "basketball", "highlights"
- **Quality Keywords**: Adds "best", "top", "greatest"

### 2. Quality Analysis
Real-time analysis of compilation results:
- AI quality scores for each clip
- Channel reputation analysis
- Duration optimization
- Content relevance verification

### 3. Smart Recommendations
AI provides actionable suggestions:
- Query refinement tips
- Quality improvement suggestions
- Error resolution guidance
- Performance optimization advice

## Integration Benefits

### **For Content Creators:**
- **Automated Workflow**: AI handles the entire compilation process
- **Quality Assurance**: Intelligent filtering ensures high-quality results
- **Batch Processing**: Create multiple compilations efficiently
- **Smart Optimization**: AI learns and improves search strategies

### **For Developers:**
- **Standardized Interface**: MCP provides consistent AI integration
- **Extensible Architecture**: Easy to add new tools and capabilities
- **Error Handling**: Robust error recovery and suggestions
- **Monitoring**: Built-in workflow status and performance tracking

## Troubleshooting

### Common Issues

1. **MCP Server Connection Failed**
   - Ensure n8n is running on localhost:5678
   - Check N8N_API_KEY is correctly set
   - Verify workflow is imported and active

2. **YouTube API Errors**
   - Enable YouTube Data API v3 in Google Cloud Console
   - Check API key permissions and quotas
   - Verify API key is correctly configured

3. **OpenAI API Issues**
   - Ensure billing is set up in OpenAI account
   - Check API key has correct permissions
   - Monitor usage limits

4. **Workflow Execution Errors**
   - Check webhook URL is accessible
   - Verify all required nodes are properly connected
   - Review n8n execution logs for details

### Testing the Integration

```bash
# Test MCP server functionality
npm run test:mcp

# Test video compilation workflow
npm run test:compilation

# Manual test with curl
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/call","params":{"name":"compile_video","arguments":{"query":"LeBron dunking"}}}'
```

## Advanced Usage

### Custom AI Prompts

Train your AI agent with specific prompts for video compilation:

```
You are a video compilation expert. When users request video compilations:

1. First, analyze their query and optimize it using the optimize_search_query tool
2. Execute the compilation with appropriate quality settings
3. Analyze the results and provide insights
4. Suggest improvements if quality is below expectations
5. Offer to create variations or related compilations

Always prioritize quality over quantity and provide detailed explanations of your optimization choices.
```

### Workflow Chaining

Chain multiple MCP tools for complex operations:

1. **Query Optimization** → **Compilation** → **Quality Analysis** → **Retry if needed**
2. **Batch Processing** → **Results Analysis** → **Best Clips Selection** → **Final Compilation**
3. **Search Variants** → **A/B Testing** → **Performance Comparison** → **Optimal Strategy**

## Future Enhancements

Planned improvements to the MCP integration:

- **Machine Learning**: Advanced query optimization based on historical success
- **Real-time Monitoring**: Live compilation progress tracking
- **Multi-source Integration**: Support for additional video platforms
- **Advanced Analytics**: Detailed performance metrics and insights
- **Custom Workflows**: User-defined compilation templates and strategies

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review n8n workflow execution logs
3. Test individual components (YouTube API, OpenAI API, n8n)
4. Verify MCP server connectivity and configuration

The MCP integration transforms your video compilation workflow into an intelligent, AI-driven system capable of autonomous operation and continuous optimization. 