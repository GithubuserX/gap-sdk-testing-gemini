/**
 * Tool Call Extractor Module - Extract MCP tool calls from agent results
 * Max 200 lines per file rule
 */

import { processOutputToolCalls } from './tool-call-processor.js';

/**
 * Extract tool call information from agent result
 * Returns object with tool call details
 * @param {Object} result - Agent result object
 * @param {Object} mcpConfig - MCP server configuration (optional, defaults to GAP)
 */
export function extractToolCalls(result, mcpConfig = null) {
  // Default to GAP if no config provided
  const expectedToolNames = mcpConfig?.allowedTools || ['get_gap_weather_forecast'];
  const expectedServerLabel = mcpConfig?.serverLabel || 'gap_agriculture_mcp_server';
  let gapMcpCalled = false;
  let mcpDataRetrieved = false;
  let toolName = null;
  let serverLabel = null;
  let mcpResponse = null;
  let toolCallsCount = 0;
  
  const toolCallIdentifiers = new Set();
  const recordToolCall = (label, candidate = {}) => {
    const candidateIds = [
      candidate.id,
      candidate.call_id,
      candidate.callId,
      candidate.providerData?.call_id,
      candidate.providerData?.callId,
      candidate.providerData?.id,
      candidate.result?.id,
      candidate.function_call_id,
      candidate.metadata?.id
    ].filter(Boolean);
    const identifier = candidateIds.find(id => !toolCallIdentifiers.has(id))
      || `${label}_${toolCallIdentifiers.size + 1}`;
    if (!toolCallIdentifiers.has(identifier)) {
      toolCallIdentifiers.add(identifier);
      toolCallsCount = toolCallIdentifiers.size;
    }
    return identifier;
  };

  // Check for tool calls in result.toolCalls
  if (result.toolCalls && Array.isArray(result.toolCalls)) {
    console.log(`  [Step 7] Found ${result.toolCalls.length} tool calls in result.toolCalls`);
    console.log(`  [Step 7] Tool calls:`, JSON.stringify(result.toolCalls, null, 2).substring(0, 500));
    
    for (const toolCall of result.toolCalls) {
      const callName = toolCall.name || toolCall.function?.name;
      console.log(`  [Step 7] Checking tool call:`, callName);
      
      // Check if this tool call matches any expected tool name
      if (expectedToolNames.includes(callName)) {
        recordToolCall('toolCalls', toolCall);
        gapMcpCalled = true;
        toolName = callName;
        serverLabel = expectedServerLabel;
        
        // Check if tool call was successful
        if (toolCall.result && !toolCall.result.isError) {
          mcpDataRetrieved = true;
          mcpResponse = JSON.stringify(toolCall.result);
          console.log(`  [Step 7] ✅ MCP tool call successful`);
        } else {
          console.log(`  [Step 7] ❌ MCP tool call failed`);
          mcpResponse = toolCall.result ? JSON.stringify(toolCall.result) : 'Tool call failed';
        }
      }
    }
  }
  
  // Also check result.output for tool calls (SDK ALWAYS puts them here, not in result.toolCalls)
  if (result.output && Array.isArray(result.output)) {
    console.log(`  [Step 7] Checking result.output for tool calls...`);
    console.log(`  [Step 7] Total items in result.output:`, result.output.length);
    
    // Log ALL items to see what we have
    for (let i = 0; i < result.output.length; i++) {
      const item = result.output[i];
      console.log(`  [Step 7] Item ${i}: type=${item.type}, name=${item.name || item.function?.name || 'N/A'}, role=${item.role || 'N/A'}`);
      
      // If it's mcp_call, log its structure to understand it
      if (item.type === 'hosted_tool_call' && item.name === 'mcp_call') {
        console.log(`  [Step 7] 🔍 Found mcp_call! Inspecting structure...`);
        console.log(`  [Step 7] mcp_call keys:`, Object.keys(item));
        console.log(`  [Step 7] mcp_call.providerData:`, item.providerData ? Object.keys(item.providerData) : 'N/A');
        console.log(`  [Step 7] mcp_call full structure:`, JSON.stringify(item, null, 2).substring(0, 1000));
      }
    }
    
    // Process tool calls from result.output
    const toolCallResult = processOutputToolCalls(result.output, gapMcpCalled, recordToolCall, expectedToolNames, expectedServerLabel);
    if (toolCallResult.found) {
      gapMcpCalled = true;
      toolName = toolCallResult.toolName;
      serverLabel = toolCallResult.serverLabel;
      mcpDataRetrieved = toolCallResult.mcpDataRetrieved;
      mcpResponse = toolCallResult.mcpResponse;
    }
  }
  
  if (!gapMcpCalled) {
    console.log(`  [Step 7] ⚠️  No tool calls detected - agent may be using training data`);
    console.log(`  [Step 7] ⚠️  Full result structure:`, JSON.stringify({
      hasToolCalls: !!result.toolCalls,
      toolCallsLength: result.toolCalls?.length,
      hasOutput: !!result.output,
      outputLength: result.output?.length,
      outputSample: result.output?.slice(0, 2)
    }, null, 2).substring(0, 1000));
  }

  return {
    gapMcpCalled,
    mcpDataRetrieved,
    toolName,
    serverLabel,
    mcpResponse,
    toolCallsCount
  };
}

