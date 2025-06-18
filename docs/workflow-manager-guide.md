# Interactive n8n Workflow Manager CLI

A comprehensive command-line interface for managing n8n workflows with discovery, validation, credential management, and deployment capabilities.

## 🚀 Features

### 📋 Workflow Discovery & Selection
- **Automatic Scanning**: Automatically scans the `./workflows/` directory for all `.json` files
- **Rich Metadata**: Displays workflow names, descriptions, node counts, file sizes, and modification dates
- **Status Indicators**: Shows validation status, webhook presence, and credential requirements
- **Interactive Selection**: Choose workflows from a numbered list with search functionality

### ✅ Workflow Validation & Repair
- **JSON Syntax Validation**: Automatically validates workflow JSON syntax
- **n8n-Specific Checks**: Validates workflow structure, node connections, and configuration
- **Issue Detection**: Identifies missing connections, disconnected nodes, and configuration problems
- **Auto-Fix Suggestions**: Provides actionable recommendations for detected issues
- **Color-Coded Results**: Clear visual feedback with error, warning, and info categorization

### 🔐 Credential Management
- **Automatic Detection**: Scans workflow nodes for credential requirements
- **Comprehensive Analysis**: Identifies API keys, authentication needs, and service credentials
- **Setup Guidance**: Provides step-by-step instructions for credential configuration
- **Security Validation**: Checks for hardcoded credentials and security best practices

### 📤 Import & Deployment
- **API Connection Testing**: Tests n8n API connectivity across multiple endpoints
- **Smart Import**: Handles different n8n API versions and endpoint variations
- **Status Reporting**: Provides detailed import progress and results
- **Error Handling**: Graceful error handling with helpful troubleshooting suggestions

## 🛠️ Installation & Setup

The CLI is already included in your project. All required dependencies are automatically installed.

### Prerequisites

- Node.js (v16 or higher)
- Access to n8n instance
- n8n API key (for import/deployment features)

### Environment Variables

Set these environment variables for full functionality:

```bash
# Required for import/deployment
export N8N_BASE_URL="http://localhost:5678"
export N8N_API_KEY="your_n8n_api_key_here"

# Optional for YouTube workflows
export YOUTUBE_API_KEY="your_youtube_api_key_here"
```

## 🎯 Usage

### Quick Start

```bash
# Using bun (recommended)
bun run workflow-manager

# Or using the short alias
bun run wm

# Using npm/node
npm run workflow-manager
```

### Main Menu Options

```
🔍 Discover & View Workflows    - Scan and display all available workflows
✅ Validate Workflow           - Check workflow syntax and configuration
🔐 Manage Credentials          - Scan and manage credential requirements
📤 Import Workflow to n8n      - Deploy workflows to your n8n instance
🔧 Test n8n Connection         - Verify API connectivity
🛠️  Run Integration Tools      - Access existing debug and validation tools
❓ Help & Usage               - Show detailed help information
🚪 Exit                       - Exit the CLI
```

## 📖 Detailed Feature Guide

### 🔍 Workflow Discovery

The discovery feature automatically scans your `./workflows/` directory and displays:

- **File Status**: ✓ (Valid) or ✗ (Invalid JSON)
- **Webhook Indicator**: 🌐 (Has webhook endpoints)
- **Credentials Indicator**: 🔐 (Requires credentials)
- **Metadata**: Node count, file size, modification date
- **Description**: Extracted from workflow metadata or sticky notes

Example output:
```
📋 Available Workflows:

 1. ✓ 🌐 🔐 Stock Analysis Assistant
    └─ AI-powered stock analysis using RSI and MACD indicators
    └─ 25 nodes, 20.1KB, modified 12/15/2024

 2. ✓ 🌐    Video Generation Workflow
    └─ Enhanced video compilation with AI analysis
    └─ 15 nodes, 29.3KB, modified 12/14/2024

Legend: ✓=Valid ✗=Invalid 🌐=Webhook 🔐=Credentials
```

### ✅ Workflow Validation

Comprehensive validation includes:

**Syntax Validation**
- JSON structure and syntax
- Required workflow properties
- Node and connection integrity

**n8n-Specific Validation**
- Node type validation
- Connection validation
- Missing path configurations
- Credential requirements

**Issue Categorization**
- **Errors** (❌): Must be fixed before import
- **Warnings** (⚠️): Should be addressed for optimal performance
- **Info** (ℹ️): Informational notices and recommendations

Example validation output:
```
✅ Workflow validation passed!

🔍 Issues Found:
⚠️ Found 2 disconnected node(s)
   Helper Node 1, Debug Output

💡 Recommendations:
ℹ️ Found 3 node(s) requiring credentials
   Fetch Stock Data (n8n-nodes-base.httpRequest), OpenAI Assistant (n8n-nodes-base.openAi)
```

### 🔐 Credential Management

The credential scanner identifies:

**Automatic Detection**
- Node-level credential requirements
- API authentication needs
- Service-specific credentials (YouTube, OpenAI, etc.)
- HTTP authentication configurations

**Setup Guidance**
- Step-by-step credential configuration
- n8n credential type recommendations
- Security best practices

Example output:
```
🔐 Credential Management for: Stock Analysis Assistant

Found 2 credential requirement(s):
   • httpCustomAuth
   • openAiAssistantApi

📋 Nodes requiring credentials:
   • Fetch Stock Data (n8n-nodes-base.httpRequest)
   • Stock Analysis Assistant (n8n-nodes-base.openAi)

💡 To configure credentials:
   1. Open n8n web interface
   2. Go to Settings > Credentials
   3. Add the required credential types
   4. Update the workflow nodes to use the credentials
```

### 📤 Import & Deployment

Smart import process:

**Connection Testing**
- Tests multiple API endpoints (`/api/workflows`, `/rest/workflows`, `/api/v1/workflows`)
- Validates API key authentication
- Confirms n8n instance accessibility

**Import Process**
- Validates workflow before import
- Handles different n8n API versions
- Provides detailed status reporting
- Returns workflow ID and access URL

Example import flow:
```
🚀 Importing: Stock Analysis Assistant

✅ Connected to n8n via /api/workflows
✅ Successfully imported: Stock Analysis Assistant
   ✓ Workflow ID: 12345
   ✓ Access at: http://localhost:5678/workflow/12345
```

### 🛠️ Integration Tools

Access to existing tools:

- **MCP Debug Suite**: Comprehensive debugging for MCP integration
- **MCP Integration Validator**: Validates MCP-n8n connections
- **MCP Integration Fixer**: Automatically fixes common issues
- **Health Check**: Tests all system components

## 🎨 User Experience Features

### Interactive Navigation
- **Arrow Key Navigation**: Use ↑/↓ to navigate menus
- **Enter to Select**: Confirm selections with Enter
- **ESC/Ctrl+C**: Exit at any point
- **Back to Menu**: Option to return to main menu from any screen

### Visual Feedback
- **Color Coding**: Green for success, red for errors, yellow for warnings
- **Progress Indicators**: Spinners for long-running operations
- **Status Icons**: Clear visual indicators for different states
- **Formatted Output**: Well-structured, easy-to-read information display

### Error Handling
- **Graceful Degradation**: Continues operation even with non-critical errors
- **Helpful Messages**: Clear error descriptions with suggested fixes
- **Recovery Options**: Always provides a path to continue or exit safely

## 🔧 Advanced Usage

### Custom Workflow Directory

By default, the CLI scans `./workflows/`. To use a different directory:

```javascript
// Modify this line in workflow-manager.js
this.workflowsDir = path.join(__dirname, '..', 'your-custom-directory');
```

### API Endpoint Configuration

The CLI automatically tries multiple endpoints. To specify a custom endpoint:

```bash
export N8N_BASE_URL="https://your-n8n-instance.com"
```

### Batch Operations

For batch processing, you can extend the CLI:

```bash
# Run validation on all workflows
bun run workflow-manager
# Select "Discover & View Workflows" to see all workflows
# Then validate each one individually
```

## 🐛 Troubleshooting

### Common Issues

**"No workflows found"**
- Check that `.json` files exist in `./workflows/` directory
- Verify file permissions and readability

**"Cannot connect to n8n API"**
- Verify `N8N_BASE_URL` is correct
- Check that `N8N_API_KEY` is set and valid
- Ensure n8n instance is running and accessible

**"Import failed"**
- Validate workflow before importing
- Check for credential requirements
- Verify n8n instance has required node types installed

**"Invalid JSON syntax"**
- Use a JSON validator to check file syntax
- Look for missing commas, brackets, or quotes
- Check for trailing commas (not allowed in JSON)

### Debug Mode

For detailed debugging information:

```bash
DEBUG=* bun run workflow-manager
```

### Log Files

Check these locations for additional troubleshooting:

- n8n logs: `~/.n8n/logs/`
- Validation results: `./validation-results.json`
- CLI errors: Console output

## 🤝 Integration with Existing Tools

The CLI seamlessly integrates with existing project tools:

- **import-workflows.js**: Uses same import logic
- **validate-mcp-integration.js**: Leverages validation functions
- **mcp-debug-suite.js**: Accessible through "Integration Tools" menu
- **fix-mcp-integration.js**: Auto-fix capabilities

## 📚 Examples

### Example 1: First-Time Setup

```bash
# 1. Set environment variables
export N8N_BASE_URL="http://localhost:5678"
export N8N_API_KEY="your_api_key"

# 2. Start the CLI
bun run wm

# 3. Test connection
# Select "🔧 Test n8n Connection"

# 4. Discover workflows
# Select "🔍 Discover & View Workflows"
```

### Example 2: Workflow Validation and Import

```bash
# Start CLI
bun run workflow-manager

# 1. Validate a workflow
# Select "✅ Validate Workflow"
# Choose workflow from list

# 2. Fix any issues found

# 3. Import the workflow
# Select "📤 Import Workflow to n8n"
# Choose same workflow
# Confirm import
```

### Example 3: Credential Management

```bash
# Start CLI
bun run wm

# 1. Check credential requirements
# Select "🔐 Manage Credentials"
# Choose workflow

# 2. Follow setup instructions in n8n

# 3. Re-validate workflow
# Select "✅ Validate Workflow"
```

## 🔮 Future Enhancements

Potential future features:

- **Workflow Templates**: Create new workflows from templates
- **Bulk Operations**: Validate/import multiple workflows at once
- **Export Functionality**: Export workflows from n8n
- **Workflow Comparison**: Compare different versions of workflows
- **Automated Testing**: Test workflow functionality after import
- **Credential Validation**: Test credential connectivity
- **Workflow Dependencies**: Analyze and manage workflow dependencies

## 📄 License

This tool is part of the n8n-video-compilation project and follows the same license terms.