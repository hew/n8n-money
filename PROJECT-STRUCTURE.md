# n8n-money Project Structure

## Directory Organization

```
n8n-money/
├── .cursorrules                    # Development rules and best practices
├── package.json                    # Node.js project configuration  
├── bun.lock                       # Bun lockfile for dependencies
├── README.md                      # Main project documentation
├── PROJECT-STRUCTURE.md           # This file
│
├── workflows/                     # n8n Workflow Definitions
│   ├── insurance-claims-workflow.json    # Insurance claims automation
│   ├── stock-analysis-workflow.json      # Stock analysis assistant
│   └── video-generation-workflow.json    # AI video compilation
│
├── scripts/                       # Automation Scripts & Utilities  
│   ├── workflow-manager.js        # 🆕 Interactive CLI for workflow management
│   ├── import-workflows.js        # Import workflows into n8n
│   ├── validate-mcp-integration.js # MCP integration validator
│   ├── fix-mcp-integration.js     # MCP integration auto-fixer
│   ├── mcp-debug-suite.js         # Comprehensive MCP debugging
│   ├── mcp-server.js             # MCP server implementation
│   └── start-mcp-demo.sh         # Demo startup script
│
├── config/                        # Configuration Files
│   └── mcp-config.json           # MCP server configuration
│
└── docs/                          # Documentation & Guides
    ├── workflow-manager-guide.md   # 🆕 Interactive CLI documentation
    ├── dev-quick-reference.md      # Quick reference for development
    ├── mcp-integration-guide.md    # MCP integration guide  
    ├── mcp-integration-summary.md  # MCP integration summary
    ├── mcp-n8n-troubleshooting.md # Troubleshooting guide
    └── video-compilation-enhanced-setup.md
```

## File Descriptions

### Root Level
- **`.cursorrules`**: Development guidelines and best practices
- **`package.json`**: Project metadata, dependencies, and npm scripts
- **`README.md`**: Main project documentation and setup instructions

### `/workflows/`
Contains n8n workflow JSON definitions that can be imported into n8n:
- **`insurance-claims-workflow.json`**: Insurance claims processing automation
- **`stock-analysis-workflow.json`**: AI-powered stock analysis with technical indicators
- **`video-generation-workflow.json`**: AI-powered video compilation workflow

### `/scripts/`
Executable scripts and utilities:
- **`workflow-manager.js`** 🆕: Interactive CLI for professional workflow management
  - Workflow discovery and validation
  - Credential management
  - Smart import with multi-API support
  - Integration with existing debug tools
- **`import-workflows.js`**: Programmatically import workflows into n8n via API
- **`validate-mcp-integration.js`**: Comprehensive MCP integration validation
- **`fix-mcp-integration.js`**: Automatic fixing of common MCP integration issues
- **`mcp-debug-suite.js`**: Comprehensive debugging tools for MCP integration
- **`mcp-server.js`**: Model Context Protocol server implementation
- **`start-mcp-demo.sh`**: Shell script to start MCP demo environment

### `/config/`
Configuration files:
- **`mcp-config.json`**: MCP server configuration including endpoints and parameters

### `/docs/`
Documentation and guides:
- **`workflow-manager-guide.md`** 🆕: Complete guide for the interactive workflow manager CLI
- **`dev-quick-reference.md`**: Quick reference for common development tasks
- **`mcp-integration-guide.md`**: Comprehensive MCP integration guide
- **`mcp-integration-summary.md`**: Summary of MCP integration process
- **`mcp-n8n-troubleshooting.md`**: Troubleshooting guide for common issues
- **`video-compilation-enhanced-setup.md`**: Video compilation setup guide

## Usage

### Interactive Workflow Manager 🆕
```bash
# Start the interactive CLI (recommended)
bun run workflow-manager
# or use the short alias
bun run wm

# Features:
# - Discover and validate workflows
# - Manage credentials interactively  
# - Smart import with error handling
# - Access to all integration tools
# - Professional UI for technical and non-technical users
```

### Legacy Scripts
```bash
# Import workflows into n8n (direct)
bun run import-workflows

# Start MCP server
bun run start

# Validation and debugging
bun run validate:mcp    # Validate MCP integration
bun run fix:mcp         # Auto-fix MCP issues
bun run debug:mcp       # Run debug suite

# Combined operations
bun run debug:all       # Run debug + validation
bun run fix:auto        # Run fix + validation

# Demo and testing
bun run test:compilation
```

### Working with Workflows
1. **Recommended**: Use `bun run workflow-manager` for interactive management
2. Workflow JSON files are stored in `/workflows/`
3. CLI provides validation, credential management, and smart import
4. Modify workflows in n8n UI, then export back to `/workflows/` directory

### Configuration
- Update `/config/mcp-config.json` for MCP server settings
- Environment variables should be set in your shell or deployment environment
- See `docs/dev-quick-reference.md` for required environment variables

#### Required Environment Variables
```bash
# For workflow import/management
export N8N_BASE_URL="http://localhost:5678"
export N8N_API_KEY="your_n8n_api_key"

# For video workflows
export YOUTUBE_API_KEY="your_youtube_api_key"
```

## Development Workflow
1. **Use the Interactive CLI**: `bun run wm` for most workflow management tasks
2. Follow `.cursorrules` for consistent development practices
3. Keep workflow definitions in `/workflows/` under version control
4. Test changes with scripts in `/scripts/` directory
5. Update documentation in `/docs/` when making significant changes
6. Use `bun` for all package management (not npm)

## Key Features

### 🆕 Interactive Workflow Manager
- **Professional UI**: Clean, color-coded interface suitable for both technical and non-technical users
- **Smart Discovery**: Automatically scans and validates all workflows
- **Comprehensive Validation**: JSON syntax, n8n configuration, and security checks
- **Credential Management**: Detects requirements and guides setup
- **Multi-API Support**: Works with different n8n versions and endpoints
- **Integration Ready**: Access to all existing debug and validation tools

### MCP Integration
- **AI Agent Support**: Enable Claude, GPT, and other LLMs to control workflows
- **Smart Query Optimization**: AI-enhanced video compilation
- **Quality Analysis**: Real-time content scoring and filtering
- **Batch Processing**: Multiple workflow executions
- **Error Recovery**: Intelligent retry mechanisms

### Professional Tools
- **Comprehensive Validation**: Multi-layer workflow checking
- **Security Scanning**: Credential and configuration security
- **Debug Suite**: Complete diagnostic tools
- **Auto-Fixing**: Automatic resolution of common issues
- **Health Monitoring**: System status and connectivity checks

This structure separates concerns and makes the project more maintainable and navigable, with the new interactive CLI providing a professional interface for all workflow management tasks. 