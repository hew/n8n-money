# Development Quick Reference

## n8n API Endpoints
```bash
# List workflows
curl -H "X-N8N-API-KEY: $N8N_API_KEY" http://localhost:5678/api/v1/workflows

# Import workflow (POST to /api/v1/workflows)
# Remove fields: active, tags, id
# Required fields: name, nodes, connections

# Workflow structure:
{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "settings": {},
  "staticData": {}
}
```

## MCP Server Testing
```bash
# Test MCP functions in order:
1. mcp_n8n-video-compilation_list_workflows
2. mcp_n8n-video-compilation_compile_video
3. mcp_n8n-video-compilation_get_workflow_status
```

## Environment Variables
```bash
# Required for n8n MCP integration
export N8N_API_KEY="your-jwt-token-here"
export N8N_BASE_URL="http://localhost:5678/api"
```

## Common Workflow Import Issues
- Remove `active: false/true` (read-only)
- Remove `tags: []` (read-only) 
- Remove `id` field (auto-generated)
- Keep `connections`, `nodes`, `name`, `settings`, `staticData`

## Webhook Path Patterns
- n8n webhook: `/webhook/{path}`
- Test webhook: `/webhook-test/{path}`
- API webhook: `/api/webhook/{path}`

## Error Handling Patterns
```javascript
// API calls with multiple endpoint fallback
const endpoints = ['/rest/workflows', '/api/v1/workflows', '/api/workflows'];
for (const endpoint of endpoints) {
  try {
    const result = await makeRequest(url + endpoint);
    if (result.ok) return result;
  } catch (error) {
    console.log(`Failed ${endpoint}: ${error.message}`);
  }
}
```

## MCP Function Parameters
```javascript
// Video compilation
{
  query: "search terms",
  max_clips: 5,
  quality_threshold: 7,
  duration_preference: "medium" // short|medium|long
}
```

## Debugging Commands
```bash
# Check n8n status
curl -s http://localhost:5678 | head -20

# Test API auth
curl -H "X-N8N-API-KEY: $N8N_API_KEY" http://localhost:5678/api/v1/workflows

# Check environment
echo "API Key: ${N8N_API_KEY:0:8}..."
```

## File Structure
```
project/
├── .cursorrules              # Development rules
├── README.md                 # Main documentation
├── PROJECT-STRUCTURE.md     # Directory organization guide
├── package.json             # Node.js project config
├── config/
│   └── mcp-config.json      # MCP server configuration  
├── scripts/
│   ├── import-workflows.js  # Workflow import script
│   ├── mcp-server.js       # MCP server implementation
│   └── test-mcp-server.js  # MCP testing utilities
├── workflows/
│   ├── insurance-claims-workflow.json
│   └── video-generation-workflow.json
└── docs/
    ├── dev-quick-reference.md  # This file
    └── *.md                    # Other documentation
``` 