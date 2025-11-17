/**
 * Process Query Module - Gemini SDK version
 * Main orchestration for processing queries with Gemini
 * Max 200 lines per file rule
 */

import { classifyIntent, detectLanguage } from '../intent-classifier.js';
import { runGuardrails } from './guardrails.js';
import { DEFAULT_FARMER_CONTEXT, KENYA_COORDINATES } from './config.js';
import { handleGuardrails } from './guardrail-handler.js';
import { updateConversationHistory, prepareConversationHistory } from './history-manager.js';
import { buildSuccessResult, buildErrorResult } from './result-builder.js';
import { createGeminiClient, generateContentWithGemini } from './gemini-agent.js';
import { executeMcpToolCall } from './gemini-mcp-tool.js';
import { generateFarmerChatPrompt } from './prompt-template.js';

/**
 * Process a single query with guardrails and Gemini agent
 */
export async function processQuery(query, index, total, conversationHistory = [], country = 'kenya', farmerContext = DEFAULT_FARMER_CONTEXT, client, guardrailFailedAgent, MCP_URL, MCP_CONFIG) {
  const startTime = Date.now();
  console.log(`\n[${index}/${total}] Processing query: "${query}"`);

  try {
    const intentResult = classifyIntent(query, country);
    const detectedLanguage = detectLanguage(query);
    console.log(`  [Step 0] Intent: ${intentResult.intent || 'none'}, Tool: ${intentResult.tool || 'none'}, Language: ${detectedLanguage}, Confidence: ${intentResult.confidence}`);
    
    const guardrailsResult = await runGuardrails(query, client);
    const guardrailResult = await handleGuardrails(query, guardrailsResult, startTime, guardrailFailedAgent, conversationHistory);
    if (guardrailResult) {
      return guardrailResult;
    }

    const ai = createGeminiClient();
    const prompt = generateFarmerChatPrompt(farmerContext, detectedLanguage, MCP_CONFIG);
    const fullPrompt = `${prompt}\n\nUser query: ${query}`;

    const headers = {
      'X-Farm-Latitude': KENYA_COORDINATES.latitude.toString(),
      'X-Farm-Longitude': KENYA_COORDINATES.longitude.toString(),
      'X-Location-Type': KENYA_COORDINATES.locationType
    };

    let response = await generateContentWithGemini(
      ai,
      fullPrompt,
      conversationHistory,
      MCP_CONFIG,
      headers,
      detectedLanguage
    );

    let toolCallInfo = {
      gapMcpCalled: false,
      mcpDataRetrieved: false,
      toolName: null,
      serverLabel: MCP_CONFIG.serverLabel,
      mcpResponse: null,
      toolCallsCount: 0
    };

    let finalOutput = response.text || '';
    const functionCalls = response.functionCalls || [];
    
    if (functionCalls.length > 0) {
      console.log(`  [Step 6] Found ${functionCalls.length} function call(s)`);
      toolCallInfo.gapMcpCalled = true;
      toolCallInfo.toolCallsCount = functionCalls.length;
      
      const functionResults = [];
      for (const funcCall of functionCalls) {
        const funcName = funcCall.name;
        const funcArgs = funcCall.args || {};
        toolCallInfo.toolName = funcName;
        
        try {
          const args = {
            latitude: KENYA_COORDINATES.latitude,
            longitude: KENYA_COORDINATES.longitude,
            days: 7,
            ...funcArgs
          };
          
          const result = await executeMcpToolCall(
            { name: funcName, args },
            MCP_CONFIG,
            headers
          );
          
          toolCallInfo.mcpDataRetrieved = true;
          toolCallInfo.mcpResponse = JSON.stringify(result);
          
          functionResults.push({
            name: funcName,
            response: result
          });
        } catch (error) {
          console.error(`  [Step 6] ❌ Function call failed:`, error.message);
          functionResults.push({
            name: funcName,
            response: { error: error.message }
          });
        }
      }
      
      const functionResponseParts = functionResults.map(result => ({
        functionResponse: {
          name: result.name,
          response: result.response
        }
      }));
      
      const contentsWithFunctions = [];
      
      for (const msg of conversationHistory) {
        if (msg.role === 'user') {
          const text = typeof msg.content === 'string' ? msg.content : msg.content?.find(p => p.type === 'text')?.text || '';
          if (text) contentsWithFunctions.push({ role: 'user', parts: [{ text }] });
        } else if (msg.role === 'assistant' || msg.role === 'model') {
          const text = typeof msg.content === 'string' ? msg.content : msg.content?.find(p => p.type === 'text')?.text || '';
          if (text) contentsWithFunctions.push({ role: 'model', parts: [{ text }] });
        }
      }
      
      contentsWithFunctions.push({ role: 'user', parts: [{ text: fullPrompt }] });
      
      if (response.candidates?.[0]?.content?.parts) {
        contentsWithFunctions.push({ 
          role: 'model', 
          parts: response.candidates[0].content.parts 
        });
      }
      
      contentsWithFunctions.push({ role: 'user', parts: functionResponseParts });
      
      const finalResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentsWithFunctions
      });
      
      finalOutput = finalResponse.text || finalOutput;
    }

    const updatedHistory = updateConversationHistory(
      { finalOutput, text: finalOutput },
      conversationHistory,
      query,
      finalOutput
    );

    const processingTime = Date.now() - startTime;
    console.log(`  ✅ Query ${index}/${total} completed in ${(processingTime / 1000).toFixed(2)}s`);
    console.log(`  📊 MCP Called: ${toolCallInfo.gapMcpCalled ? 'YES ✅' : 'NO ❌'}`);
    if (toolCallInfo.gapMcpCalled) {
      console.log(`  📊 MCP Data Retrieved: ${toolCallInfo.mcpDataRetrieved ? 'YES ✅' : 'NO ❌'}`);
    }

    // Build and return success result
    return buildSuccessResult(
      query,
      finalOutput,
      intentResult,
      detectedLanguage,
      country,
      toolCallInfo,
      processingTime,
      updatedHistory
    );

  } catch (error) {
    console.error(`  ❌ Error processing query ${index}/${total}:`, error);
    return buildErrorResult(query, error, startTime, conversationHistory);
  }
}
