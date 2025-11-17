/**
 * Batch Testing Script for GAP MCP Server using Google Gemini SDK
 * 
 * This script uses Google Gemini SDK with structured data support:
 * - Gemini function calling for MCP tools
 * - Structured output support
 * - Guardrails (Jailbreak, Moderation, PII detection via OpenAI)
 * - Hosted MCP server on Railway
 * - Chat history management
 * - Excel export with detailed results
 * 
 * Usage:
 *   node batch-test-sdk.js [--queries=5|10|100]
 * 
 * Environment Variables Required:
 *   - GEMINI_API_KEY (for Gemini SDK)
 *   - OPENAI_API_KEY (for guardrails)
 *   - MCP_SERVER_TYPE (GAP or ACCUWEATHER, default: GAP)
 *   - GAP_MCP_URL (optional, defaults to Railway URL)
 *   - ACCUWEATHER_MCP_URL (optional, defaults to Railway URL)
 * 
 * Output:
 *   - Excel file: gap-sdk-test-results-YYYY-MM-DD-HHMMSS.xlsx in test-results/ folder
 *   - Console logs with detailed results
 */

import 'dotenv/config';
import { OpenAI } from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Import modules
import { runGuardrails, GUARDRAIL_FAILED_AGENT_PROMPT } from './utils/guardrails.js';
import { DEFAULT_FARMER_CONTEXT, getActiveMcpConfig, MCP_SERVER_TYPE } from './utils/config.js';
import { COMPREHENSIVE_QUERIES, SWAHILI_QUERIES } from './utils/queries.js';
import { exportToExcel, printSummary } from './utils/excel-utils.js';
import { processQuery } from './utils/process-query.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables and MCP setup
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MCP_CONFIG = getActiveMcpConfig();
const MCP_URL = MCP_CONFIG.url;

// Validate API keys
if (!GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY environment variable is required for guardrails');
  process.exit(1);
}

// Initialize OpenAI client (for guardrails only)
const client = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// Guardrail Failed Agent (using OpenAI client directly for guardrails)
const guardrailFailedAgent = client; // Use OpenAI client directly
guardrailFailedAgent.instructions = GUARDRAIL_FAILED_AGENT_PROMPT;

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(70));
  console.log('GAP MCP Server Batch Testing Script (Google Gemini SDK)');
  console.log('='.repeat(70));
  console.log('Script started at:', new Date().toISOString());
  console.log(`  - MCP Server Type: ${MCP_SERVER_TYPE}`);
  console.log(`  - MCP Server URL: ${MCP_URL}`);
  console.log(`  - MCP Server Label: ${MCP_CONFIG.serverLabel}`);
  console.log(`  - MCP Tool Name: ${MCP_CONFIG.toolName}`);
  
  // Farmer context
  const farmerContext = {
    name: process.env.FARMER_NAME || DEFAULT_FARMER_CONTEXT.name,
    fullName: process.env.FARMER_FULL_NAME || DEFAULT_FARMER_CONTEXT.fullName,
    location: process.env.FARMER_LOCATION || DEFAULT_FARMER_CONTEXT.location,
    farmSize: process.env.FARMER_FARM_SIZE || DEFAULT_FARMER_CONTEXT.farmSize,
    primaryCrops: process.env.FARMER_CROPS ? process.env.FARMER_CROPS.split(',').map(c => c.trim()) : DEFAULT_FARMER_CONTEXT.primaryCrops,
    experience: process.env.FARMER_EXPERIENCE || DEFAULT_FARMER_CONTEXT.experience,
    language: process.env.FARMER_LANGUAGE || DEFAULT_FARMER_CONTEXT.language
  };
  
  // Clean up old Excel files
  try {
    const testResultsDir = path.join(__dirname, 'test-results');
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }
    const oldFiles = fs.readdirSync(testResultsDir).filter(f => f.endsWith('.xlsx'));
    if (oldFiles.length > 0) {
      console.log(`Cleaning up ${oldFiles.length} old Excel files...`);
      oldFiles.forEach(file => {
        try {
          fs.unlinkSync(path.join(testResultsDir, file));
        } catch (e) {
          console.warn(`Warning: Could not delete ${file}:`, e.message);
        }
      });
    }
  } catch (e) {
    console.warn('Warning: Could not clean up old files:', e.message);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  let numQueries = 5; // Default
  
  args.forEach(arg => {
    if (arg.startsWith('--queries=')) {
      numQueries = parseInt(arg.split('=')[1], 10);
    }
  });

  console.log(`\nRunning ${numQueries} queries per language (English + Swahili)`);
  console.log(`Total queries: ${numQueries * 2}\n`);

  // Get queries
  const englishQueries = COMPREHENSIVE_QUERIES.slice(0, numQueries);
  const swahiliQueries = SWAHILI_QUERIES.slice(0, numQueries);

  // Process English queries
  console.log('\n' + '='.repeat(70));
  console.log('PROCESSING ENGLISH QUERIES');
  console.log('='.repeat(70));
  const englishResults = [];
  let englishHistory = [];

  for (let i = 0; i < englishQueries.length; i++) {
    const result = await processQuery(
      englishQueries[i],
      i + 1,
      englishQueries.length,
      englishHistory,
      'kenya',
      farmerContext,
      client,
      guardrailFailedAgent,
      MCP_URL,
      MCP_CONFIG
    );
    englishResults.push(result);
    englishHistory = result.conversationHistory || [];
  }

  // Process Swahili queries
  console.log('\n' + '='.repeat(70));
  console.log('PROCESSING SWAHILI QUERIES');
  console.log('='.repeat(70));
  const swahiliResults = [];
  let swahiliHistory = [];

  for (let i = 0; i < swahiliQueries.length; i++) {
    const result = await processQuery(
      swahiliQueries[i],
      i + 1,
      swahiliQueries.length,
      swahiliHistory,
      'kenya',
      farmerContext,
      client,
      guardrailFailedAgent,
      MCP_URL,
      MCP_CONFIG
    );
    swahiliResults.push(result);
    swahiliHistory = result.conversationHistory || [];
  }

  // Print summary
  printSummary(englishResults, 'English');
  printSummary(swahiliResults, 'Swahili');

  // Export to Excel
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `gap-sdk-test-results-${timestamp}.xlsx`;
  const excelFile = exportToExcel(englishResults, swahiliResults, filename, farmerContext);
  console.log(`\n✓ Excel file saved: ${excelFile}`);

  console.log('\n' + '='.repeat(70));
  console.log('✅ Batch testing complete!');
  console.log(`📁 Results saved to: ${excelFile}`);
  console.log(`📄 Filename: ${filename}`);
  console.log('='.repeat(70));
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

