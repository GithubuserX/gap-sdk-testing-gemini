/**
 * History Manager Module - Manage conversation history extraction and updates
 * Max 200 lines per file rule
 */

import { extractMessagesFromOutput, applySlidingWindowToMessages, MAX_HISTORY_MESSAGES } from './history-utils.js';

/**
 * Update conversation history from agent result
 * Returns updated history array
 */
export function updateConversationHistory(result, conversationHistory, query, finalOutput) {
  console.log(`  [Step 8] Extracting conversation history...`);
  let updatedHistory = [];
  
  // Create current user message
  const currentMessage = {
    role: "user",
    content: [{ type: "input_text", text: query }]
  };
  
  if (result.output && Array.isArray(result.output)) {
    // Extract messages from result.output
    const extractedMessages = extractMessagesFromOutput(result.output);
    console.log(`  [Step 8] Extracted ${extractedMessages.length} messages from result.output`);
    
    // IMPORTANT: result.output may only contain NEW messages from this run
    // We need to combine with existing conversationHistory + currentMessage
    updatedHistory = [...conversationHistory];
    
    // Add current user message if not already in extracted messages
    const hasCurrentUserMessage = extractedMessages.some(m => 
      m.role === 'user' && 
      m.content?.[0]?.text === query
    );
    if (!hasCurrentUserMessage) {
      updatedHistory.push(currentMessage);
    }
    
    // Add extracted messages (these are the new assistant responses and possibly user messages)
    for (const msg of extractedMessages) {
      // Only add if it's not already in history
      const isDuplicate = updatedHistory.some(existing => 
        existing.role === msg.role &&
        existing.content?.[0]?.text === msg.content?.[0]?.text
      );
      if (!isDuplicate) {
        updatedHistory.push(msg);
      }
    }
    
    // Apply sliding window
    updatedHistory = applySlidingWindowToMessages(updatedHistory);
    console.log(`  [Step 8] Combined history: ${updatedHistory.length} messages (max ${MAX_HISTORY_MESSAGES})`);
  } else {
    // Fallback: build history from current conversation
    console.log(`  [Step 8] ⚠️  result.output not found, building history from current conversation`);
    updatedHistory = [...conversationHistory];
    
    // Add current user message
    updatedHistory.push(currentMessage);
    
    // Add assistant response
    updatedHistory.push({
      role: "assistant",
      content: [{ type: "output_text", text: finalOutput }]
    });
    
    // Apply sliding window
    updatedHistory = applySlidingWindowToMessages(updatedHistory);
    console.log(`  [Step 8] Built history: ${updatedHistory.length} messages (max ${MAX_HISTORY_MESSAGES})`);
  }

  return updatedHistory;
}

/**
 * Prepare conversation history for agent run
 * Returns array of messages including current query
 * @param {Array} conversationHistory - Previous conversation history
 * @param {string} query - Current user query
 * @param {string} detectedLanguage - Detected language of current query ('en' or 'sw')
 */
export function prepareConversationHistory(conversationHistory, query, detectedLanguage = 'en') {
  const historyMessages = conversationHistory.length > 0 ? [...conversationHistory] : [];
  
  // Add current query with language context
  const currentMessage = {
    role: "user",
    content: [{ type: "input_text", text: query }]
  };
  historyMessages.push(currentMessage);
  
  // Add language instruction as system message if needed to reinforce language matching
  // Note: This is handled in the prompt, but we ensure the current query is clear
  
  return { historyMessages, currentMessage };
}

