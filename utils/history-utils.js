/**
 * Chat History Management Module
 * Max 200 lines per file rule
 */

const DEFAULT_HISTORY_LIMIT = 200;
const parsedLimit = parseInt(process.env.MAX_HISTORY_MESSAGES || '', 10);
export const MAX_HISTORY_MESSAGES = Number.isFinite(parsedLimit) && parsedLimit > 0
  ? Math.min(parsedLimit, 400)
  : DEFAULT_HISTORY_LIMIT; // Keep enough messages for ~100 queries by default

/**
 * Extract user and assistant messages from result.output
 * According to OpenAI Agents SDK docs: result.output contains full conversation history
 * But it includes tool calls and other items with IDs that aren't persisted when store=false
 * We need to extract only user/assistant messages and convert them to plain format
 */
export function extractMessagesFromOutput(output) {
  if (!Array.isArray(output)) {
    return [];
  }
  
  const messages = [];
  for (const item of output) {
    // Extract only user and assistant messages
    if (item.role === 'user' || item.role === 'assistant') {
      // Extract text content from the item
      let text = '';
      if (Array.isArray(item.content)) {
        // Find text content in the array
        for (const contentItem of item.content) {
          if (contentItem.type === 'input_text' || contentItem.type === 'output_text') {
            text = contentItem.text || '';
            break;
          }
        }
      } else if (typeof item.content === 'string') {
        text = item.content;
      }
      
      // Only add if we have text content
      if (text) {
        messages.push({
          role: item.role,
          content: [{ type: item.role === 'user' ? 'input_text' : 'output_text', text: text }]
        });
      }
    }
  }
  
  return messages;
}

/**
 * Apply sliding window to extracted messages
 * Keeps only the most recent N messages to avoid token limits
 */
export function applySlidingWindowToMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }
  
  // If messages exceed limit, keep only the most recent messages
  if (messages.length > MAX_HISTORY_MESSAGES) {
    const excess = messages.length - MAX_HISTORY_MESSAGES;
    return messages.slice(excess); // Remove oldest messages
  }
  
  return messages;
}
