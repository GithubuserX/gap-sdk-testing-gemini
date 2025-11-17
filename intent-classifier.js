/**
 * Intent Classification System for Multilingual Agricultural Chatbot
 * 
 * This module provides semantic intent classification without regex dependencies.
 * Uses pattern matching with language detection and country-specific intent mapping.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load intents configuration
const INTENTS_CONFIG = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'intents.json'), 'utf-8')
);

/**
 * Simple language detection based on character patterns
 * Returns language code: 'en', 'sw', 'am', etc.
 */
export function detectLanguage(text) {
  // Amharic: Uses Ethiopic script (U+1200–U+137F)
  if (/[\u1200-\u137F]/.test(text)) {
    return 'am';
  }
  
  // Swahili: Common Swahili words/patterns
  const swahiliPatterns = /\b(joto|mvua|hali ya hewa|kupanda|kumwagilia|mahindi|maharage|nyanya|sawa|wakati|wiki|kesho|leo|unyevu|upepo|kutakuwa|utakuwa|vipi|nipande|je|naweza|siku|zijazo|mkuu|mawingu|mawingu)\b/i;
  if (swahiliPatterns.test(text)) {
    return 'sw';
  }
  
  // Default to English
  return 'en';
}

/**
 * Normalize text for pattern matching
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Check if text matches any pattern in the given language
 */
function matchesPatterns(text, patterns, language) {
  const normalized = normalizeText(text);
  const langPatterns = patterns[language] || patterns['en'] || [];
  
  // Check for exact word matches
  for (const pattern of langPatterns) {
    // Create word boundary regex for whole word matching
    const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(normalized)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Classify intent for a given query
 * 
 * @param {string} query - User query
 * @param {string} country - Country code (e.g., 'kenya', 'ethiopia')
 * @returns {Object} Intent classification result
 */
export function classifyIntent(query, country = 'kenya') {
  if (!query || typeof query !== 'string') {
    return {
      intent: null,
      tool: null,
      confidence: 0,
      language: 'en',
      country: country,
      reason: 'Invalid query'
    };
  }

  const language = detectLanguage(query);
  const countryConfig = INTENTS_CONFIG.countries[country];
  
  if (!countryConfig) {
    return {
      intent: null,
      tool: null,
      confidence: 0,
      language: language,
      country: country,
      reason: `Country '${country}' not found in intents config`
    };
  }

  // Check country-specific intents
  const intents = countryConfig.intents || {};
  const matchedIntents = [];

  for (const [intentName, intentConfig] of Object.entries(intents)) {
    if (matchesPatterns(query, intentConfig.patterns, language)) {
      matchedIntents.push({
        intent: intentName,
        tool: intentConfig.tool,
        priority: intentConfig.priority || 1,
        confidence: 1.0, // High confidence for pattern match
        language: language,
        country: country
      });
    }
  }

  // Check global tools
  for (const [toolName, toolConfig] of Object.entries(INTENTS_CONFIG.global_tools || {})) {
    if (toolConfig.available && toolConfig.intents) {
      for (const [intentName, intentConfig] of Object.entries(toolConfig.intents)) {
        if (matchesPatterns(query, intentConfig.patterns, language)) {
          matchedIntents.push({
            intent: intentName,
            tool: intentConfig.tool,
            priority: intentConfig.priority || 1,
            confidence: 0.9, // Slightly lower confidence for global tools
            language: language,
            country: country,
            scope: 'global'
          });
        }
      }
    }
  }

  // Sort by priority (higher priority first), then by confidence
  matchedIntents.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return b.confidence - a.confidence;
  });

  if (matchedIntents.length > 0) {
    const bestMatch = matchedIntents[0];
    return {
      ...bestMatch,
      allMatches: matchedIntents,
      reason: `Matched intent: ${bestMatch.intent}`
    };
  }

  // No intent matched
  return {
    intent: null,
    tool: null,
    confidence: 0,
    language: language,
    country: country,
    reason: 'No matching intent found'
  };
}

/**
 * Get tool configuration for a given tool name and country
 */
export function getToolConfig(toolName, country = 'kenya') {
  const countryConfig = INTENTS_CONFIG.countries[country];
  
  if (countryConfig && countryConfig.tools && countryConfig.tools[toolName]) {
    return countryConfig.tools[toolName];
  }

  // Check global tools
  for (const [globalToolName, toolConfig] of Object.entries(INTENTS_CONFIG.global_tools || {})) {
    if (toolConfig.intents) {
      for (const [intentName, intentConfig] of Object.entries(toolConfig.intents)) {
        if (intentConfig.tool === toolName) {
          return {
            ...toolConfig,
            tool: toolName
          };
        }
      }
    }
  }

  return null;
}

/**
 * Get all available tools for a country
 */
export function getAvailableTools(country = 'kenya') {
  const countryConfig = INTENTS_CONFIG.countries[country];
  const tools = {};

  // Add country-specific tools
  if (countryConfig && countryConfig.tools) {
    for (const [toolName, toolConfig] of Object.entries(countryConfig.tools)) {
      if (toolConfig.available) {
        tools[toolName] = toolConfig;
      }
    }
  }

  // Add global tools
  for (const [toolName, toolConfig] of Object.entries(INTENTS_CONFIG.global_tools || {})) {
    if (toolConfig.available) {
      tools[toolName] = toolConfig;
    }
  }

  return tools;
}

/**
 * Validate intent classification result
 */
export function validateIntentClassification(result) {
  if (!result || !result.intent) {
    return {
      valid: false,
      reason: 'No intent matched'
    };
  }

  if (!result.tool) {
    return {
      valid: false,
      reason: 'Intent matched but no tool specified'
    };
  }

  const toolConfig = getToolConfig(result.tool, result.country);
  if (!toolConfig || !toolConfig.available) {
    return {
      valid: false,
      reason: `Tool '${result.tool}' not available for country '${result.country}'`
    };
  }

  return {
    valid: true,
    toolConfig: toolConfig
  };
}

