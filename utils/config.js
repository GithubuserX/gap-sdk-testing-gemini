/**
 * Configuration Constants Module
 * Max 200 lines per file rule
 */

// Kenya coordinates (Nairobi) - ensures GAP MCP server is used
export const KENYA_COORDINATES = {
  latitude: -1.2864,
  longitude: 36.8172,
  locationType: 'east-africa'
};

// MCP Server Configuration
export const MCP_SERVER_CONFIG = {
  GAP: {
    url: process.env.GAP_MCP_URL || 'https://gap-agriculture-mcp-server.up.railway.app/mcp',
    serverLabel: 'gap_agriculture_mcp_server',
    toolName: 'get_gap_weather_forecast',
    allowedTools: ['get_gap_weather_forecast'],
    description: 'GAP Agriculture MCP Server for Kenya and East Africa'
  },
  ACCUWEATHER: {
    url: process.env.ACCUWEATHER_MCP_URL || 'https://accuweather-mcp-server.up.railway.app/mcp',
    serverLabel: 'accuweather_mcp_server',
    toolName: 'get_accuweather_weather_forecast',
    allowedTools: ['get_accuweather_weather_forecast', 'get_accuweather_current_conditions'],
    description: 'AccuWeather MCP Server for global weather forecasts'
  }
};

// Get MCP server type from environment (default: GAP)
export const MCP_SERVER_TYPE = (process.env.MCP_SERVER_TYPE || 'GAP').toUpperCase();

// Get active MCP server configuration
export const getActiveMcpConfig = () => {
  const serverType = MCP_SERVER_TYPE;
  if (serverType === 'ACCUWEATHER' || serverType === 'ACCU') {
    return MCP_SERVER_CONFIG.ACCUWEATHER;
  }
  return MCP_SERVER_CONFIG.GAP; // Default to GAP
};

// Farmer/User Context (for personalization) - Default values, can be overridden
export const DEFAULT_FARMER_CONTEXT = {
  name: "Kamau",
  fullName: "Kamau Wanjiru",
  location: "Nairobi, Kenya",
  farmSize: "2 hectares",
  primaryCrops: ["maize", "beans", "tomatoes"],
  experience: "5 years",
  language: "bilingual" // English and Swahili
};

