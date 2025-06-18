#!/usr/bin/env node

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

class VideoCompilationMCPServer {
  constructor() {
    this.server = new McpServer({
      name: 'n8n-video-compilation',
      version: '1.0.0',
    });

    this.n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678/api';
    this.n8nApiKey = process.env.N8N_API_KEY;
    this.setupTools();
  }

  setupTools() {
    // Tool: Compile video with AI enhancements
    this.server.tool(
      'compile_video',
      {
        query: z.string().describe('Search query for video compilation (e.g., "LeBron dunking")'),
        max_clips: z.number().default(5).describe('Maximum number of clips (default: 5)'),
        quality_threshold: z.number().default(7).describe('AI quality score threshold 1-10 (default: 7)'),
        duration_preference: z.enum(['short', 'medium', 'long']).default('medium').describe('Preferred clip duration (default: medium)')
      },
      async (args) => await this.compileVideo(args)
    );

    // Tool: Optimize search query
    this.server.tool(
      'optimize_search_query',
      {
        original_query: z.string().describe('Original search query to optimize'),
        previous_results: z.array(z.any()).optional().describe('Previous compilation results for learning')
      },
      async (args) => await this.optimizeSearchQuery(args)
    );

    // Tool: Batch compile multiple videos
    this.server.tool(
      'batch_compile',
      {
        queries: z.array(z.string()).describe('Array of search queries to compile'),
        settings: z.record(z.any()).optional().describe('Global settings for all compilations')
      },
      async (args) => await this.batchCompile(args)
    );

    // Tool: List available workflows
    this.server.tool(
      'list_workflows',
      {},
      async () => await this.listWorkflows()
    );

    // Tool: Get workflow status
    this.server.tool(
      'get_workflow_status',
      {
        workflowId: z.string().describe('ID of the workflow to check')
      },
      async (args) => await this.getWorkflowStatus(args.workflowId)
         );
  }

  async compileVideo(args) {
    const { query, max_clips = 5, quality_threshold = 7, duration_preference = 'medium' } = args;

    try {
      // Enhanced query processing
      const optimizedQuery = await this.enhanceQuery(query);
      
      // Execute the enhanced video compilation workflow
      const webhookUrl = 'http://localhost:5678/webhook-test/compile-video';
      const response = await axios.post(webhookUrl, {
        query: optimizedQuery,
        max_clips,
        quality_threshold,
        duration_preference,
      });

      const result = response.data;
      
      // Add AI insights
      const insights = await this.analyzeCompilationResults(result);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              compilation: result,
              insights: insights,
              optimization: {
                original_query: query,
                optimized_query: optimizedQuery,
                improvements_applied: this.getOptimizationDetails(query, optimizedQuery),
              },
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'error',
              error: error.message,
              suggestions: await this.getSuggestions(query, error),
            }, null, 2),
          },
        ],
      };
    }
  }

  async listWorkflows() {
    try {
      const response = await axios.get(`${this.n8nBaseUrl}/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey,
        },
      });

      const workflows = response.data.data || [];
      const videoWorkflows = workflows.filter(w => 
        w.name.toLowerCase().includes('video') || 
        w.name.toLowerCase().includes('compilation')
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_workflows: workflows.length,
              video_workflows: videoWorkflows.length,
              workflows: videoWorkflows.map(w => ({
                id: w.id,
                name: w.name,
                active: w.active,
                tags: w.tags,
              })),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: error.message }, null, 2),
          },
        ],
      };
    }
  }

  async getWorkflowStatus(workflowId) {
    try {
      const response = await axios.get(`${this.n8nBaseUrl}/workflows/${workflowId}`, {
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey,
        },
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: error.message }, null, 2),
          },
        ],
      };
    }
  }

  async optimizeSearchQuery(args) {
    const { original_query, previous_results = [] } = args;
    
    // AI-powered query optimization logic
    const optimizations = {
      player_recognition: this.recognizePlayer(original_query),
      action_enhancement: this.enhanceAction(original_query),
      context_addition: this.addContext(original_query),
      quality_keywords: this.addQualityKeywords(original_query),
    };

    const optimized_query = this.applyOptimizations(original_query, optimizations);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            original_query,
            optimized_query,
            optimizations_applied: optimizations,
            confidence_score: this.calculateConfidence(optimizations),
            suggestions: this.generateSuggestions(original_query, previous_results),
          }, null, 2),
        },
      ],
    };
  }

  async batchCompile(args) {
    const { queries, settings = {} } = args;
    const results = [];

    for (const query of queries) {
      try {
        const result = await this.compileVideo({ query, ...settings });
        results.push({
          query,
          status: 'success',
          result: JSON.parse(result.content[0].text),
        });
      } catch (error) {
        results.push({
          query,
          status: 'error',
          error: error.message,
        });
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            batch_results: results,
            summary: {
              total: queries.length,
              successful: results.filter(r => r.status === 'success').length,
              failed: results.filter(r => r.status === 'error').length,
            },
          }, null, 2),
        },
      ],
    };
  }

  // AI Helper Methods
  async enhanceQuery(query) {
    // Simple enhancement logic - can be expanded with actual AI
    const playerMap = {
      'lebron': 'LeBron James',
      'curry': 'Stephen Curry',
      'kobe': 'Kobe Bryant',
      'jordan': 'Michael Jordan',
    };

    const actionMap = {
      'dunk': 'dunks compilation highlights',
      'three': 'three pointers compilation',
      'block': 'blocks compilation',
    };

    let enhanced = query.toLowerCase();
    
    // Replace player names
    for (const [short, full] of Object.entries(playerMap)) {
      if (enhanced.includes(short)) {
        enhanced = enhanced.replace(short, full);
      }
    }

    // Enhance actions
    for (const [action, enhancement] of Object.entries(actionMap)) {
      if (enhanced.includes(action)) {
        enhanced = enhanced.replace(action, enhancement);
      }
    }

    return enhanced;
  }

  async analyzeCompilationResults(result) {
    if (!result.downloadCommands) return { analysis: 'No results to analyze' };

    const insights = {
      quality_analysis: {
        average_ai_score: result.qualityInfo?.averageAiScore || 0,
        total_clips: result.totalClips || 0,
        ai_analyzed: result.qualityInfo?.aiAnalyzed || false,
      },
      content_analysis: {
        channels: [...new Set(result.downloadCommands.map(cmd => cmd.channelTitle))],
        duration_range: this.calculateDurationRange(result.downloadCommands),
      },
      recommendations: this.generateRecommendations(result),
    };

    return insights;
  }

  calculateDurationRange(commands) {
    const durations = commands.map(cmd => cmd.duration || 30);
    return {
      min: Math.min(...durations),
      max: Math.max(...durations),
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
    };
  }

  generateRecommendations(result) {
    const recommendations = [];
    
    if (result.qualityInfo?.averageAiScore < 7) {
      recommendations.push('Consider refining search terms for better content quality');
    }
    
    if (result.totalClips < 3) {
      recommendations.push('Try broader search terms to find more clips');
    }
    
    return recommendations;
  }

  recognizePlayer(query) {
    const players = ['lebron', 'curry', 'kobe', 'jordan', 'giannis', 'durant'];
    return players.find(player => query.toLowerCase().includes(player)) || null;
  }

  enhanceAction(query) {
    const actions = ['dunk', 'three', 'block', 'steal', 'assist'];
    return actions.find(action => query.toLowerCase().includes(action)) || null;
  }

  addContext(query) {
    const contexts = ['NBA', 'basketball', 'highlights', 'compilation'];
    return contexts.filter(context => !query.toLowerCase().includes(context.toLowerCase()));
  }

  addQualityKeywords(query) {
    const qualityKeywords = ['best', 'top', 'greatest', 'amazing'];
    return qualityKeywords.filter(keyword => !query.toLowerCase().includes(keyword.toLowerCase()));
  }

  applyOptimizations(query, optimizations) {
    let optimized = query;
    
    if (optimizations.player_recognition) {
      // Already handled in enhanceQuery
    }
    
    if (optimizations.context_addition.length > 0) {
      optimized += ' ' + optimizations.context_addition.join(' ');
    }
    
    return optimized;
  }

  calculateConfidence(optimizations) {
    let score = 0.5; // Base confidence
    
    if (optimizations.player_recognition) score += 0.2;
    if (optimizations.action_enhancement) score += 0.2;
    if (optimizations.context_addition.length > 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  generateSuggestions(query, previousResults) {
    return [
      'Try adding specific player names',
      'Include action keywords like "dunks", "blocks", "assists"',
      'Add quality modifiers like "best", "top", "greatest"',
      'Consider time-based filters like "2024", "recent", "classic"',
    ];
  }

  async getSuggestions(query, error) {
    const suggestions = [];
    
    if (error.message.includes('API')) {
      suggestions.push('Check YouTube API key configuration');
      suggestions.push('Ensure YouTube Data API v3 is enabled');
    }
    
    if (error.message.includes('webhook')) {
      suggestions.push('Verify n8n workflow is active');
      suggestions.push('Check webhook URL configuration');
    }
    
    suggestions.push('Try a different search query');
    suggestions.push('Check network connectivity');
    
    return suggestions;
  }

  getOptimizationDetails(original, optimized) {
    const details = [];
    
    if (original !== optimized) {
      details.push('Enhanced player name recognition');
      details.push('Added context keywords');
      details.push('Improved action descriptions');
    }
    
    return details;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Video Compilation MCP Server running on stdio');
  }
}

// Start the server
if (require.main === module) {
  const server = new VideoCompilationMCPServer();
  server.run().catch(console.error);
}

module.exports = VideoCompilationMCPServer;