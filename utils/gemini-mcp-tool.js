/**
 * Gemini MCP Tool Converter Module
 * Converts MCP server tools to Gemini Function Declarations
 * Max 200 lines per file rule
 */

import { Type } from '@google/genai';

/**
 * Convert MCP server URL and tool info to Gemini Function Declaration
 * For hosted MCP servers, we create a function declaration that will call the MCP server
 */
export function createMcpFunctionDeclaration(mcpConfig, headers = {}) {
  const toolName = mcpConfig.toolName || 'get_gap_weather_forecast';
  
  // Define the function declaration based on tool name
  if (toolName === 'get_gap_weather_forecast' || toolName === 'get_accuweather_weather_forecast') {
    return {
      name: toolName,
      description: mcpConfig.description || 'Get weather forecast data for agricultural planning',
      parameters: {
        type: Type.OBJECT,
        properties: {
          latitude: {
            type: Type.NUMBER,
            description: 'Latitude coordinate (e.g., -1.2864 for Nairobi)'
          },
          longitude: {
            type: Type.NUMBER,
            description: 'Longitude coordinate (e.g., 36.8172 for Nairobi)'
          },
          days: {
            type: Type.INTEGER,
            description: 'Number of days for forecast (1-14, default: 7)'
          }
        },
        required: [] // All optional since headers provide defaults
      }
    };
  }
  
  // Default function declaration
  return {
    name: toolName,
    description: mcpConfig.description || 'MCP tool function',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  };
}

/**
 * Execute MCP tool call by calling the hosted MCP server
 */
export async function executeMcpToolCall(functionCall, mcpConfig, headers = {}) {
  const { name, args } = functionCall;
  
  if (!mcpConfig.allowedTools.includes(name)) {
    throw new Error(`Tool ${name} is not allowed`);
  }
  
  // Prepare MCP JSON-RPC request
  const mcpRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: name,
      arguments: args || {}
    },
    id: Date.now().toString()
  };
  
  const response = await fetch(mcpConfig.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      ...headers
    },
    body: JSON.stringify(mcpRequest)
  });
  
  if (!response.ok) {
    throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
    const text = await response.text();
    const jsonMatch = text.match(/\{[\s\S]*"jsonrpc"[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      if (result.error) {
        throw new Error(`MCP error: ${result.error.message}`);
      }
      return result.result;
    }
    throw new Error(`MCP server returned unexpected format: ${text.substring(0, 100)}`);
  }
  
  const result = await response.json();
  
  if (result.error) {
    throw new Error(`MCP error: ${result.error.message}`);
  }
  
  return result.result;
}

