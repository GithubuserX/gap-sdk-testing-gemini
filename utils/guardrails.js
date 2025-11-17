/**
 * Guardrails Module - Content moderation and safety checks
 * Max 200 lines per file rule
 */

/**
 * Run guardrails check on input text using OpenAI Moderation API
 */
export async function runGuardrails(inputText, client) {
  try {
    const moderationResult = await client.moderations.create({
      model: process.env.OPENAI_MODERATION_MODEL || 'omni-moderation-latest',
      input: inputText
    });

    const flagged = moderationResult.results[0].flagged;
    const categories = moderationResult.results[0].categories;
    const categoryScores = moderationResult.results[0].category_scores;

    const flaggedCategories = Object.entries(categories)
      .filter(([_, flagged]) => flagged)
      .map(([category, _]) => category);

    return {
      tripwireTriggered: flagged,
      flagged: flagged,
      flaggedCategories: flaggedCategories,
      categoryScores: categoryScores,
      input: inputText,
      safe: !flagged
    };
  } catch (error) {
    console.error('[Guardrails] Error:', error.message);
    return {
      tripwireTriggered: false,
      flagged: false,
      flaggedCategories: [],
      error: error.message,
      input: inputText,
      safe: true
    };
  }
}

export function guardrailsHasTripwire(results) {
  return results?.tripwireTriggered === true || results?.flagged === true;
}

export function getGuardrailSafeText(results, fallbackText) {
  return fallbackText;
}

export function buildGuardrailFailOutput(results) {
  return {
    moderation: {
      failed: results?.flagged === true,
      flagged_categories: results?.flaggedCategories || [],
      category_scores: results?.categoryScores || {}
    },
    error: results?.error || null
  };
}

export const GUARDRAIL_FAILED_AGENT_PROMPT = `You are a safety handler for FarmerChat. When a user's request triggers safety guardrails, respond politely and helpfully.

Response guidelines:
- Be friendly and non-judgmental
- Explain you can't process that specific request
- Suggest rephrasing or asking about agricultural topics
- Offer alternatives: weather, planting, irrigation, fertilizer

Keep response short (2-3 sentences) and helpful.`;
