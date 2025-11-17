import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.join(__dirname, '..', 'prompts', 'farmerchat-template.md');
const templateContent = fs.readFileSync(templatePath, 'utf-8');
const sanitizedTemplate = templateContent.replace(/`/g, '\\`');
const templateRenderer = new Function(
  'context',
  `with (context) { return \`${sanitizedTemplate}\`; }`
);

const MULTILINGUAL_PROMPTS = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'multilingual-prompts.json'), 'utf-8')
);

export function generateFarmerChatPrompt(farmerContext, language = 'en', mcpConfig = null) {
  const {
    name,
    location,
    farmSize,
    primaryCrops,
    experience,
    language: farmerLanguage
  } = farmerContext;

  // Default to GAP if no config provided
  const toolName = mcpConfig?.toolName || 'get_gap_weather_forecast';
  const allowedTools = mcpConfig?.allowedTools || ['get_gap_weather_forecast'];
  
  const langConfig = MULTILINGUAL_PROMPTS.languages[language] || MULTILINGUAL_PROMPTS.languages.en;
  
  // Generate dynamic tool section based on actual tool name
  let toolSection = langConfig.prompt_sections.tool_section;
  let criticalRules = langConfig.prompt_sections.critical_rules;
  
  // Replace tool name references with actual tool name
  toolSection = toolSection.replace(/get_gap_weather_forecast/g, toolName);
  criticalRules = criticalRules.replace(/get_gap_weather_forecast/g, toolName);
  // Also replace ${toolName} placeholder if it exists
  criticalRules = criticalRules.replace(/\$\{toolName\}/g, toolName);
  const languageInstructions = language === 'sw'
    ? `**MUHIMU SANA:** Swali la sasa la mtumiaji ni kwa Kiswahili. Jibu kwa Kiswahili tu. Usitumie Kiingereza. Usijali historia ya mazungumzo - jibu kwa Kiswahili tu kwa swali hili la sasa.`
    : `**CRITICAL LANGUAGE RULE:** The current user query is in English. You MUST respond in English ONLY. Do NOT use Swahili. Ignore conversation history - respond in English for this current query.`;

  const cropsList = Array.isArray(primaryCrops) ? primaryCrops.join(', ') : primaryCrops;

  return templateRenderer({
    name,
    location,
    farmSize,
    cropsList,
    experience,
    farmerLanguage,
    languageInstructions,
    criticalRules,
    toolSection,
    toolName: toolName
  });
}
