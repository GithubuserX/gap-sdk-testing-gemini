/**
 * Result Builder Module - Build result objects for query processing
 * Max 200 lines per file rule
 */

/**
 * Build success result object
 */
export function buildSuccessResult(query, finalOutput, intentResult, detectedLanguage, country, toolCallInfo, processingTime, updatedHistory) {
  const processingTimeSeconds = (processingTime / 1000).toFixed(2);
  
  return {
    query,
    response: finalOutput,
    intent: intentResult.intent,
    intentConfidence: intentResult.confidence,
    detectedLanguage: detectedLanguage,
    country: country,
    gapMcpCalled: toolCallInfo.gapMcpCalled,
    mcpDataRetrieved: toolCallInfo.mcpDataRetrieved,
    toolName: toolCallInfo.toolName,
    serverLabel: toolCallInfo.serverLabel,
    mcpResponse: toolCallInfo.mcpResponse,
    details: toolCallInfo.gapMcpCalled 
      ? (toolCallInfo.mcpDataRetrieved ? 'MCP tool called and data retrieved successfully' : 'MCP tool called but data retrieval failed')
      : 'MCP tool not called',
    processingTimeMs: processingTime,
    processingTimeSeconds: parseFloat(processingTimeSeconds),
    toolCallsCount: toolCallInfo.toolCallsCount,
    timestamp: new Date().toISOString(),
    status: toolCallInfo.gapMcpCalled && toolCallInfo.mcpDataRetrieved ? 'success' : (toolCallInfo.gapMcpCalled ? 'mcp_failed' : 'no_mcp_call'),
    conversationHistory: updatedHistory
  };
}

/**
 * Build error result object
 */
export function buildErrorResult(query, error, startTime, conversationHistory) {
  const processingTime = Date.now() - startTime;
  const processingTimeSeconds = (processingTime / 1000).toFixed(2);
  
  return {
    query,
    response: `Error: ${error.message}`,
    gapMcpCalled: false,
    mcpDataRetrieved: false,
    toolName: null,
    serverLabel: null,
    mcpResponse: 'N/A',
    details: `Error: ${error.message}`,
    processingTimeMs: processingTime,
    processingTimeSeconds: parseFloat(processingTimeSeconds),
    toolCallsCount: 0,
    timestamp: new Date().toISOString(),
    status: 'error',
    conversationHistory: conversationHistory
  };
}

