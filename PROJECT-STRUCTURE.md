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
│   ├── insurance-claims-workflow.json
│   └── video-generation-workflow.json
│
├── scripts/                       # Automation Scripts & Utilities  
│   ├── import-workflows.js        # Import workflows into n8n
│   ├── mcp-server.js             # MCP server implementation
│   ├── test-mcp-server.js        # MCP server testing
│   └── start-mcp-demo.sh         # Demo startup script
│
├── config/                        # Configuration Files
│   └── mcp-config.json           # MCP server configuration
│
└── docs/                          # Documentation & Guides
    ├── dev-quick-reference.md     # Quick reference for development
    ├── mcp-integration-guide.md   # MCP integration guide  
    ├── mcp-integration-summary.md # MCP integration summary
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
- **`video-generation-workflow.json`**: AI-powered video compilation workflow

### `/scripts/`
Executable scripts and utilities:
- **`import-workflows.js`**: Programmatically import workflows into n8n via API
- **`mcp-server.js`**: Model Context Protocol server implementation
- **`test-mcp-server.js`**: Testing utilities for MCP server functionality
- **`start-mcp-demo.sh`**: Shell script to start MCP demo environment

### `/config/`
Configuration files:
- **`mcp-config.json`**: MCP server configuration including endpoints and parameters

### `/docs/`
Documentation and guides:
- **`dev-quick-reference.md`**: Quick reference for common development tasks
- **`mcp-integration-guide.md`**: Comprehensive MCP integration guide
- **`mcp-integration-summary.md`**: Summary of MCP integration process
- **`video-compilation-enhanced-setup.md`**: Video compilation setup guide

## Usage

### Running Scripts
```bash
# Import workflows into n8n
bun run import-workflows

# Start MCP server
bun run start

# Test MCP functionality  
bun run test:mcp

# Start demo environment
bun run test:compilation
```

### Working with Workflows
1. Workflow JSON files are stored in `/workflows/`
2. Use `bun run import-workflows` to import them into your n8n instance
3. Modify workflows in n8n UI, then export back to `/workflows/` directory

### Configuration
- Update `/config/mcp-config.json` for MCP server settings
- Environment variables should be set in your shell or deployment environment
- See `docs/dev-quick-reference.md` for required environment variables

## Development Workflow
1. Follow `.cursorrules` for consistent development practices
2. Keep workflow definitions in `/workflows/` under version control
3. Test changes with scripts in `/scripts/` directory
4. Update documentation in `/docs/` when making significant changes
5. Use `bun` for all package management (not npm)

This structure separates concerns and makes the project more maintainable and navigable. 