/**
 * Gemini Agent Module - Create and manage Gemini agents
 * Max 200 lines per file rule
 */

import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import { DEFAULT_FARMER_CONTEXT } from './config.js';
import { generateFarmerChatPrompt } from './prompt-template.js';
import { createMcpFunctionDeclaration } from './gemini-mcp-tool.js';

/**
 * Create Gemini AI client
 */
export function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Create Gemini function declaration from MCP config
 */
export function createGeminiTool(mcpConfig, headers = {}) {
  const functionDeclaration = createMcpFunctionDeclaration(mcpConfig, headers);
  return {
    functionDeclarations: [functionDeclaration]
  };
}

/**
 * Generate content with Gemini using MCP tools
 */
export async function generateContentWithGemini(
  ai,
  prompt,
  conversationHistory = [],
  mcpConfig,
  headers = {},
  language = 'en'
) {
  // Create function declaration
  const tool = createGeminiTool(mcpConfig, headers);
  
  // Build conversation history
  const contents = [];
  
  // Add conversation history
  for (const msg of conversationHistory) {
    if (msg.role === 'user') {
      const text = typeof msg.content === 'string' 
        ? msg.content 
        : msg.content?.find(p => p.type === 'text')?.text || '';
      if (text) {
        contents.push({ role: 'user', parts: [{ text }] });
      }
    } else if (msg.role === 'assistant') {
      const text = typeof msg.content === 'string'
        ? msg.content
        : msg.content?.find(p => p.type === 'text')?.text || '';
      if (text) {
        contents.push({ role: 'model', parts: [{ text }] });
      }
    }
  }
  
  // Add current prompt
  contents.push({ role: 'user', parts: [{ text: prompt }] });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      tools: [tool],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.AUTO
        }
      }
    }
  });
  
  return response;
}

