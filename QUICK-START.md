# 🚀 Quick Start Guide: AI-Powered Career Magnetism System

## Prerequisites

1. **n8n running locally**: Make sure n8n is running on `http://localhost:5678`
2. **API Key**: You need an n8n API key

## Step 1: Get Your n8n API Key

### Option A: Generate API Key (Recommended)
1. Open n8n at `http://localhost:5678`
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Copy the generated key

### Option B: Use JWT Token
1. Log into n8n web interface
2. Open browser developer tools (F12)
3. Go to **Application** → **Cookies** → `http://localhost:5678`
4. Find `n8n-auth` cookie and copy its value

## Step 2: Set Environment Variables

Create a `.env` file in your project root:

```bash
# Required - Replace with your actual values
N8N_API_KEY=your_api_key_here
N8N_BASE_URL=http://localhost:5678

# Optional - For enhanced functionality
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_api_key
SERPAPI_KEY=your_serpapi_key
GITHUB_TOKEN=your_github_token
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

Or export them in your shell:
```bash
export N8N_API_KEY="your_api_key_here"
export N8N_BASE_URL="http://localhost:5678"
```

## Step 3: Deploy the System

### Check Environment Setup
```bash
bun run career:setup
```

### Deploy AI Job Market Intelligence Dashboard
```bash
bun run career:deploy
```

## Step 4: Test Your System

Once deployed, you'll get:
- **Public API**: `http://localhost:5678/webhook/ai-job-intelligence`
- **Admin Panel**: `http://localhost:5678/workflow/[workflow-id]`
- **Landing Page**: `ai-job-intelligence-landing.html`

Test the API:
```bash
curl http://localhost:5678/webhook/ai-job-intelligence
```

## Step 5: Share & Promote

1. **Open the generated landing page** in your browser
2. **Share on LinkedIn**: "Just built an AI job market intelligence dashboard"
3. **Post on Twitter**: Include the API URL for real-time data
4. **Submit to Hacker News**: Title it "I built an AI job market intelligence API"
5. **Create GitHub repo**: Showcase your automation skills

## Optional: Enhanced Functionality

### Get Free API Keys

1. **Adzuna Jobs API** (1000 requests/month free)
   - Sign up at https://developer.adzuna.com
   - Add `ADZUNA_APP_ID` and `ADZUNA_API_KEY` to your environment

2. **SerpAPI** (100 searches/month free)
   - Sign up at https://serpapi.com
   - Add `SERPAPI_KEY` to your environment

3. **GitHub Token** (for publishing reports as gists)
   - Generate at https://github.com/settings/tokens
   - Add `GITHUB_TOKEN` to your environment

4. **Slack Webhook** (for notifications)
   - Set up at https://api.slack.com/incoming-webhooks
   - Add `SLACK_WEBHOOK_URL` to your environment

## Troubleshooting

### n8n Connection Issues
- Make sure n8n is running: `bunx n8n`
- Check if accessible: `curl http://localhost:5678/healthz`
- Verify API key is correct

### Environment Variables Not Loading
- Check `.env` file is in project root
- Use `source .env` to load variables
- Or use `export VAR=value` directly

### Workflow Import Fails
- Check n8n logs for errors
- Verify API key has proper permissions
- Try importing manually via n8n web interface

## What's Next?

🎯 **You've just deployed Strategy #1 of 10!**

Check out the complete strategic blueprint:
- **Master Plan**: `docs/career-magnetism-master-plan.md`
- **Strategy #2**: AI Recruiter Hunter (48-hour implementation)
- **Strategy #3**: Automated Outreach Engine (72-hour implementation)
- **Strategy #4**: Proof-of-Concept Marketplace (1-week implementation)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review n8n logs for detailed error messages
3. Ensure all prerequisites are met
4. Try the manual workflow import via n8n interface

---

**🎉 Congratulations!** You now have an AI-powered career magnetism system working 24/7 to attract opportunities!