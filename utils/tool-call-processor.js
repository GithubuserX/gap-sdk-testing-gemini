/**
 * Tool Call Processor Module - Process tool calls from result.output array
 * Max 200 lines per file rule
 */

/**
 * Process tool calls from result.output array
 * @param {Array} output - Result output array
 * @param {boolean} alreadyFound - Whether tool call already found
 * @param {Function} recordToolCall - Function to record tool calls
 * @param {Array} expectedToolNames - Array of expected tool names to match
 * @param {string} expectedServerLabel - Expected server label
 */
export function processOutputToolCalls(output, alreadyFound, recordToolCall, expectedToolNames = ['get_gap_weather_forecast'], expectedServerLabel = 'gap_agriculture_mcp_server') {
  let gapMcpCalled = alreadyFound;
  let mcpDataRetrieved = false;
  let toolName = null;
  let serverLabel = null;
  let mcpResponse = null;
  
  for (const item of output) {
    // Check for mcp_call wrapper (SDK wraps tool calls in mcp_call)
    if (item.type === 'hosted_tool_call' && item.name === 'mcp_call') {
      const mcpCallResult = processMcpCall(item, recordToolCall, expectedToolNames, expectedServerLabel);
      if (mcpCallResult.found) {
        return mcpCallResult;
      }
    }
    
    // Check for hosted_tool_call with expected tool names (direct - less common)
    if (item.type === 'hosted_tool_call' && expectedToolNames.includes(item.name)) {
      recordToolCall('hosted_tool_call', item);
      gapMcpCalled = true;
      toolName = item.name;
      serverLabel = expectedServerLabel;
      console.log(`  [Step 7] ✅ Found ${item.name} call directly in result.output!`);
      console.log(`  [Step 7] Tool call status:`, item.status);
      console.log(`  [Step 7] Tool call result exists:`, !!item.result);
      
      // Check if tool call was successful
      if (item.result && !item.result.isError && item.status === 'completed') {
        mcpDataRetrieved = true;
        mcpResponse = JSON.stringify(item.result);
        console.log(`  [Step 7] ✅ MCP tool call successful`);
      } else {
        console.log(`  [Step 7] ❌ MCP tool call failed or incomplete`);
        mcpResponse = item.result ? JSON.stringify(item.result) : 'Tool call in progress or failed';
      }
      return { found: true, toolName, serverLabel, mcpDataRetrieved, mcpResponse };
    }
    
    // Also check for tool_calls array in assistant messages (legacy format)
    if (item.type === 'tool_call' || (item.role === 'assistant' && item.tool_calls)) {
      const toolCalls = item.tool_calls || (item.tool_call ? [item.tool_call] : []);
      console.log(`  [Step 7] Found potential tool call item:`, item.type || item.role);
      for (const toolCall of toolCalls) {
        const toolName_check = toolCall.function?.name || toolCall.name;
        console.log(`  [Step 7] Checking tool:`, toolName_check);
        if (expectedToolNames.includes(toolName_check)) {
          recordToolCall('legacy_tool_call', toolCall);
          gapMcpCalled = true;
          toolName = toolName_check;
          serverLabel = expectedServerLabel;
          console.log(`  [Step 7] Found tool call in result.output`);
          return { found: true, toolName, serverLabel, mcpDataRetrieved: false, mcpResponse: null };
        }
      }
    }
  }
  
  return { found: false };
}

/**
 * Process mcp_call wrapper item
 * @param {Object} item - MCP call item
 * @param {Function} recordToolCall - Function to record tool calls
 * @param {Array} expectedToolNames - Array of expected tool names to match
 * @param {string} expectedServerLabel - Expected server label
 */
function processMcpCall(item, recordToolCall, expectedToolNames = ['get_gap_weather_forecast'], expectedServerLabel = 'gap_agriculture_mcp_server') {
  console.log(`  [Step 7] 🔍 Found mcp_call wrapper, checking contents...`);
  
  // Log structure for debugging (only first time to avoid spam)
  console.log(`  [Step 7] mcp_call keys:`, Object.keys(item));
  console.log(`  [Step 7] mcp_call.providerData keys:`, item.providerData ? Object.keys(item.providerData) : 'N/A');
  
  // Check providerData.name FIRST (this is where SDK stores the tool name)
  let toolName_found = null;
  
  if (item.providerData && item.providerData.name) {
    toolName_found = item.providerData.name;
    console.log(`  [Step 7] Tool name from providerData.name:`, toolName_found);
  } else if (item.providerData) {
    // Try other possible locations
    toolName_found = item.providerData.tool_name || 
                   item.providerData.function?.name ||
                   item.providerData.tool?.name ||
                   (item.providerData.params && item.providerData.params.name);
    if (toolName_found) {
      console.log(`  [Step 7] Tool name from providerData (alternative):`, toolName_found);
    }
  }
  
  // Check arguments/input as fallback
  if (!toolName_found && (item.arguments || item.input)) {
    const args = item.arguments || item.input;
    toolName_found = args?.name || args?.tool_name || args?.function?.name;
    if (toolName_found) {
      console.log(`  [Step 7] Tool name from arguments/input:`, toolName_found);
    }
  }
  
  // If we found an expected tool name OR if mcp_call is completed (assume it's our tool)
  if (expectedToolNames.includes(toolName_found) || 
      (item.status === 'completed' && !toolName_found)) {
    
    // If no tool name found but status is completed, assume it's the first expected tool
    if (!toolName_found && item.status === 'completed') {
      console.log(`  [Step 7] ⚠️  mcp_call completed but tool name not found - assuming ${expectedToolNames[0]}`);
      toolName_found = expectedToolNames[0];
    }
    
    if (expectedToolNames.includes(toolName_found)) {
      recordToolCall('mcp_call', item);
      const toolName = toolName_found;
      const serverLabel = expectedServerLabel;
      console.log(`  [Step 7] ✅ Found ${toolName_found} in mcp_call!`);
      console.log(`  [Step 7] Tool call status:`, item.status);
      console.log(`  [Step 7] Tool call output exists:`, !!item.output);
      
      // Check if tool call was successful
      // SDK stores result in item.output (JSON string), not item.result
      let mcpDataRetrieved = false;
      let mcpResponse = null;
      
      if (item.status === 'completed' && item.output) {
        try {
          // Parse the output to verify it's valid JSON
          const outputData = JSON.parse(item.output);
          
          // Check if it has the expected structure (forecast data)
          if (outputData.forecast && Array.isArray(outputData.forecast)) {
            mcpDataRetrieved = true;
            mcpResponse = item.output; // Keep as JSON string for consistency
            console.log(`  [Step 7] ✅ MCP tool call successful - forecast data retrieved`);
            console.log(`  [Step 7] Forecast days:`, outputData.forecast.length);
          } else {
            console.log(`  [Step 7] ⚠️  MCP tool call completed but output structure unexpected`);
            mcpResponse = item.output;
          }
        } catch (parseError) {
          console.log(`  [Step 7] ⚠️  MCP tool call output is not valid JSON:`, parseError.message);
          mcpResponse = item.output;
        }
      } else if (item.status === 'completed' && item.result && !item.result.isError) {
        // Fallback: check item.result if it exists
        mcpDataRetrieved = true;
        mcpResponse = JSON.stringify(item.result);
        console.log(`  [Step 7] ✅ MCP tool call successful (from result)`);
      } else {
        console.log(`  [Step 7] ❌ MCP tool call failed or incomplete`);
        mcpResponse = item.output || (item.result ? JSON.stringify(item.result) : 'Tool call in progress or failed');
      }
      
      return { found: true, toolName, serverLabel, mcpDataRetrieved, mcpResponse };
    }
  }
  
  return { found: false };
}

