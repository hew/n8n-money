# MCP-n8n Integration Troubleshooting Guide

## 🚀 Quick Start Debugging

If you're experiencing issues with the MCP-n8n integration, start here:

```bash
# Run the comprehensive debugging suite
bun run debug:mcp

# Run integration validation
bun run validate:mcp

# Attempt automatic fixes
bun run fix:mcp
```

## 📋 Step-by-Step Debugging Checklist

### 1. Environment Setup Validation

#### ✅ Check Environment Variables
```bash
echo "N8N_BASE_URL: $N8N_BASE_URL"
echo "N8N_API_KEY: $N8N_API_KEY"
echo "YOUTUBE_API_KEY: $YOUTUBE_API_KEY"
```

**Expected Values:**
- `N8N_BASE_URL`: `http://localhost:5678` (or your n8n server URL)
- `N8N_API_KEY`: Your n8n API key
- `YOUTUBE_API_KEY`: Your YouTube Data API v3 key

#### ✅ Verify n8n Server Status
```bash
curl -X GET "$N8N_BASE_URL/healthz" -H "X-N8N-API-KEY: $N8N_API_KEY"
```

**Expected Response:** 200 OK

### 2. Workflow Validation

#### ✅ Check Workflow Status
```bash
curl -X GET "$N8N_BASE_URL/api/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json"
```

**Verify:**
- Video compilation workflow exists
- Workflow is active (`"active": true`)
- Webhook node is configured

#### ✅ Test Webhook Directly
```bash
curl -X POST "$N8N_BASE_URL/webhook/compile-video" \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "max_clips": 1}'
```

**Expected Response:** 200 OK with compilation results

### 3. MCP Server Validation

#### ✅ Check MCP Configuration
```bash
cat config/mcp-config.json | jq '.mcpServers."n8n-video-compilation"'
```

**Verify:**
- Base URL matches environment
- Command points to local script
- Environment variables are set

#### ✅ Test MCP Server Startup
```bash
bun run start:mcp
```

**Expected:** Server starts without errors

## 🐛 Common Issues and Solutions

### Issue 1: 404 Error - Webhook Not Found

**Symptoms:**
- Direct webhook calls work (200 OK)
- MCP server calls fail with 404
- Error: "Cannot POST /webhook-test/compile-video"

**Root Cause:** URL mismatch between MCP server and workflow

**Solution:**
1. Check webhook path in workflow:
   ```bash
   bun run validate:mcp
   ```

2. Update MCP server URL:
   ```javascript
   // In scripts/mcp-server.js
   const webhookUrl = 'http://localhost:5678/webhook/compile-video';  // Correct
   // NOT: 'http://localhost:5678/webhook-test/compile-video'
   ```

3. Auto-fix:
   ```bash
   bun run fix:mcp
   ```

### Issue 2: Authentication Failures

**Symptoms:**
- Error: "Unauthorized" or 401
- API calls to n8n fail
- Missing or invalid API key

**Solution:**
1. Generate n8n API key:
   - Go to n8n Settings → API Keys
   - Create new key
   - Copy to environment

2. Set environment variable:
   ```bash
   export N8N_API_KEY="your_api_key_here"
   # or add to .env file
   echo "N8N_API_KEY=your_api_key_here" >> .env
   ```

3. Verify API access:
   ```bash
   bun run validate:mcp
   ```

### Issue 3: YouTube API Issues

**Symptoms:**
- Workflow fails at YouTube search step
- Error: "API key not valid"
- Quota exceeded errors

**Solution:**
1. Get YouTube API key:
   - Go to Google Cloud Console
   - Enable YouTube Data API v3
   - Create credentials (API key)

2. Set environment variable:
   ```bash
   export YOUTUBE_API_KEY="your_youtube_api_key"
   ```

3. Test API access:
   ```bash
   curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&key=$YOUTUBE_API_KEY"
   ```

### Issue 4: Workflow Not Active

**Symptoms:**
- Webhook responds but nothing happens
- No workflow execution logs
- Workflow shows as inactive

**Solution:**
1. Activate workflow in n8n UI
2. Or via API:
   ```bash
   curl -X PATCH "$N8N_BASE_URL/api/workflows/{workflow_id}" \
     -H "X-N8N-API-KEY: $N8N_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"active": true}'
   ```

### Issue 5: Network Connectivity Issues

**Symptoms:**
- Connection refused errors
- Timeouts
- Cannot reach n8n server

**Solution:**
1. Check n8n is running:
   ```bash
   ps aux | grep n8n
   netstat -tlnp | grep 5678
   ```

2. Test basic connectivity:
   ```bash
   curl -I http://localhost:5678
   ```

3. Check firewall settings
4. Verify Docker containers (if using Docker)

### Issue 6: Configuration Mismatches

**Symptoms:**
- Environment variables don't match config
- Using wrong package versions
- Conflicting URL patterns

**Solution:**
1. Run comprehensive validation:
   ```bash
   bun run validate:mcp
   ```

2. Auto-fix configuration:
   ```bash
   bun run fix:mcp
   ```

3. Manual fixes:
   - Update `config/mcp-config.json`
   - Sync environment variables
   - Use local scripts instead of npx

## 🔧 Advanced Debugging

### Enable Debug Logging

Add to your environment:
```bash
export DEBUG=mcp:*
export NODE_ENV=development
```

### Inspect Network Traffic

Use network debugging tools:
```bash
# Monitor HTTP requests
sudo tcpdump -i lo port 5678

# Use curl with verbose output
curl -v -X POST "$N8N_BASE_URL/webhook/compile-video" \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

### Check n8n Logs

```bash
# If running with Docker
docker logs n8n

# If running as service
journalctl -u n8n -f

# Check workflow execution logs in n8n UI
```

### Database Inspection

If workflows aren't saving correctly:
```bash
# Connect to n8n database (SQLite example)
sqlite3 ~/.n8n/database.sqlite
.tables
SELECT name, active FROM workflow_entity;
```

## ⚡ Performance Optimization

### 1. Webhook Response Times

**Problem:** Slow webhook responses
**Solutions:**
- Reduce `max_clips` parameter
- Optimize YouTube search queries
- Use caching for repeated searches
- Implement async processing

### 2. Memory Usage

**Problem:** High memory consumption
**Solutions:**
- Limit concurrent workflow executions
- Optimize AI model usage
- Clean up temporary files
- Monitor heap usage

### 3. API Rate Limits

**Problem:** YouTube API quota exceeded
**Solutions:**
- Implement request caching
- Use multiple API keys (rotate)
- Optimize search queries
- Add retry logic with backoff

### 4. Network Latency

**Problem:** Slow network requests
**Solutions:**
- Use CDN for video downloads
- Implement request timeouts
- Add connection pooling
- Use compression

## 📊 Monitoring and Alerts

### Health Check Endpoints

Create monitoring scripts:
```bash
#!/bin/bash
# health-check.sh

# Check n8n health
curl -f "$N8N_BASE_URL/healthz" || exit 1

# Check webhook response
curl -f -X POST "$N8N_BASE_URL/webhook/compile-video" \
  -H "Content-Type: application/json" \
  -d '{"query": "health check", "max_clips": 1}' || exit 1

echo "All systems operational"
```

### Log Monitoring

Set up log aggregation:
```bash
# Monitor error patterns
tail -f ~/.n8n/logs/n8n.log | grep -i error

# Count successful vs failed executions
grep "execution" ~/.n8n/logs/n8n.log | grep -c "success"
grep "execution" ~/.n8n/logs/n8n.log | grep -c "error"
```

## 🆘 Emergency Recovery

### 1. Reset Configuration

```bash
# Backup current config
cp config/mcp-config.json config/mcp-config.json.backup

# Reset to default
git checkout config/mcp-config.json

# Restart services
bun run start:mcp
```

### 2. Restart n8n

```bash
# Docker
docker restart n8n

# Service
sudo systemctl restart n8n

# Manual process
pkill -f n8n
n8n start
```

### 3. Clear Cache and Temporary Files

```bash
# Clear n8n cache
rm -rf ~/.n8n/cache/*

# Clear workflow temporary files
rm -rf /tmp/n8n-*

# Restart with clean state
bun run start:mcp
```

## 📞 Getting Help

### 1. Gather Debug Information

Before seeking help, collect this information:
```bash
# Run diagnostic suite
bun run debug:mcp > debug-output.txt

# Get system information
uname -a > system-info.txt
node --version >> system-info.txt
bun --version >> system-info.txt

# Get configuration
cat config/mcp-config.json > config-state.json
env | grep -E "(N8N|YOUTUBE)" > env-vars.txt
```

### 2. Check Documentation

- [n8n Documentation](https://docs.n8n.io/)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)

### 3. Community Resources

- n8n Community Forum
- GitHub Issues
- Discord/Slack channels
- Stack Overflow (tag: n8n)

## 🔄 Regular Maintenance

### Daily Checks

```bash
# Quick health check
bun run validate:mcp --quick

# Check logs for errors
grep -i error ~/.n8n/logs/n8n.log | tail -10
```

### Weekly Maintenance

```bash
# Full diagnostic
bun run debug:mcp

# Clean up old logs
find ~/.n8n/logs -name "*.log" -mtime +7 -delete

# Update dependencies
bun update
```

### Monthly Tasks

```bash
# Backup configuration
tar -czf backup-$(date +%Y%m%d).tar.gz config/ workflows/ scripts/

# Review and optimize workflows
# Update API keys if needed
# Check for n8n updates
```

## 📈 Success Metrics

Track these metrics to ensure healthy operation:

- **Webhook Response Time**: < 2 seconds
- **Success Rate**: > 95%
- **Error Rate**: < 5%
- **Memory Usage**: < 500MB
- **CPU Usage**: < 50%

Use these scripts for monitoring:
```bash
# Response time test
time curl -X POST "$N8N_BASE_URL/webhook/compile-video" \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "max_clips": 1}' > /dev/null

# Success rate tracking
grep "webhook" ~/.n8n/logs/n8n.log | \
  awk '{success += /200/; total++} END {print "Success rate:", success/total*100"%"}'
```

---

## 🎯 Summary

This troubleshooting guide covers the most common issues with MCP-n8n integration. Always start with the automated tools (`bun run debug:mcp`, `bun run validate:mcp`, `bun run fix:mcp`) before manual debugging.

For complex issues, gather comprehensive debug information and consult the community resources. Regular maintenance and monitoring will prevent most issues from occurring.

Remember: The automated debugging suite can solve 80% of common issues automatically. Use `bun run fix:mcp` as your first line of defense!