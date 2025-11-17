/**
 * Guardrail Handler Module - Handle guardrail checks and blocked requests
 * Max 200 lines per file rule
 */

import { guardrailsHasTripwire, getGuardrailSafeText, buildGuardrailFailOutput } from './guardrails.js';

/**
 * Handle guardrail check and return early if triggered
 * Returns null if guardrails passed, or result object if blocked
 */
export async function handleGuardrails(query, guardrailsResult, startTime, guardrailFailedAgent, conversationHistory) {
  const guardrailsHastripwire = guardrailsHasTripwire(guardrailsResult);
  const guardrailsAnonymizedtext = getGuardrailSafeText(guardrailsResult, query);
  
  // Log guardrail details for verification
  if (guardrailsHastripwire) {
    const guardrailDetails = buildGuardrailFailOutput(guardrailsResult ?? []);
    console.log(`  [Step 1] ⚠️  Guardrails triggered:`, JSON.stringify(guardrailDetails, null, 2));
  } else {
    console.log(`  [Step 1] ✅ Guardrails passed - no issues detected`);
  }

  if (guardrailsHastripwire) {
    console.log(`  ⚠️  Guardrails triggered`);
    const guardrailOutput = buildGuardrailFailOutput(guardrailsResult ?? []);

    let guardrailResponse = "Guardrail triggered - request blocked";
    
    if (guardrailFailedAgent && typeof guardrailFailedAgent.chat === 'function') {
      try {
        const completion = await guardrailFailedAgent.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: guardrailFailedAgent.instructions || "You are a helpful assistant that handles blocked requests." },
            { role: "user", content: guardrailsAnonymizedtext }
          ],
          temperature: 0.7
        });
        guardrailResponse = completion.choices[0]?.message?.content || guardrailResponse;
      } catch (error) {
        console.error(`  ⚠️  Error generating guardrail response:`, error.message);
      }
    }

    const processingTime = Date.now() - startTime;
    const processingTimeSeconds = (processingTime / 1000).toFixed(2);
    
    return {
      query,
      response: guardrailResponse,
      gapMcpCalled: false,
      mcpDataRetrieved: false,
      toolName: null,
      serverLabel: null,
      mcpResponse: 'N/A',
      details: 'Guardrails triggered',
      processingTimeMs: processingTime,
      processingTimeSeconds: parseFloat(processingTimeSeconds),
      toolCallsCount: 0,
      timestamp: new Date().toISOString(),
      status: 'guardrail_blocked',
      guardrailDetails: guardrailOutput,
      conversationHistory: conversationHistory
    };
  }

  return null; // Guardrails passed, continue processing
}

