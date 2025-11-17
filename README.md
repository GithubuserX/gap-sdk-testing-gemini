# 🤖 GAP SDK Testing - Google Gemini

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Gemini](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-blue)](https://ai.google.dev/gemini-api/docs)
[![MCP](https://img.shields.io/badge/Protocol-MCP-orange)](https://modelcontextprotocol.io)

**Advanced testing framework for agricultural AI agents using Google Gemini SDK with native structured data support and Model Context Protocol (MCP) integration. Part of the TomorrowNow Global Access Platform (GAP) ecosystem.**

---

## 🎯 Overview

This testing framework leverages Google Gemini 2.5 Flash's structured data capabilities to test agricultural AI agents with enhanced data extraction and analysis. It provides parallel testing capabilities alongside the OpenAI SDK version for comprehensive agent evaluation.

### Key Features

- ✅ **Google Gemini SDK**: Native integration with `@google/generative-ai`
- ✅ **Structured Data Support**: Gemini's native structured output capabilities
- ✅ **Function Calling**: Advanced tool invocation with `FunctionCallingConfigMode`
- ✅ **MCP Server Integration**: Seamless integration with GAP and AccuWeather MCP servers
- ✅ **Batch Testing**: Run hundreds of queries with automated result collection
- ✅ **Intent Classification**: 100% coverage with automatic intent detection
- ✅ **Multilingual Support**: English and Swahili query testing
- ✅ **Guardrails**: Moderation, jailbreak detection, PII detection (via OpenAI)
- ✅ **Conversation History**: Maintains context across multi-turn conversations
- ✅ **Excel Export**: Detailed results with metrics and analysis

---

## ✨ Features

### Gemini-Specific Advantages

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Structured Data** | Native structured output support | Better data extraction and analysis |
| **Function Calling** | Advanced tool invocation modes | More reliable tool calling |
| **Fast Responses** | Gemini 2.5 Flash optimization | Lower latency, cost-effective |
| **Multi-Modal** | Text + image support (future) | Enhanced capabilities |

### Testing Capabilities

- **Batch Testing**: Run 5, 10, 100+ queries per language
- **Intent Classification**: 100% coverage requirement
- **Language Detection**: English/Swahili detection
- **Tool Call Tracking**: Monitor MCP server call success rates
- **Guardrail Testing**: Safety and moderation filters
- **Performance Metrics**: Response time, success rate tracking
- **Excel Reports**: Comprehensive test results export

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- OpenAI API key (for guardrails)
- MCP server deployed (GAP or AccuWeather)

### Installation

```bash
# Clone the repository
git clone https://github.com/eagleisbatman/gap-sdk-testing-gemini.git
cd gap-sdk-testing-gemini

# Install dependencies
npm install
```

### Configuration

Create a `.env` file:

```env
# Required: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Required: OpenAI API Key (for guardrails)
OPENAI_API_KEY=sk-your-openai-api-key-here

# MCP Server Configuration (choose one)
# Option 1: Use GAP MCP Server (default)
MCP_SERVER_TYPE=GAP
GAP_MCP_URL=https://gap-agriculture-mcp-server.up.railway.app/mcp

# Option 2: Use AccuWeather MCP Server
# MCP_SERVER_TYPE=ACCUWEATHER
# ACCUWEATHER_MCP_URL=https://accuweather-mcp-server.up.railway.app/mcp
```

### Running Tests

```bash
# Test with 5 queries per language (default)
npm test

# Test with 10 queries per language
npm run test:10

# Test with 100 queries per language
npm run test:100

# Custom number of queries
node batch-test-sdk.js --queries=50
```

---

## 📊 Test Results

Results are automatically saved to `test-results/` folder with timestamp:

```
test-results/gap-sdk-test-results-YYYY-MM-DD-HHMMSS.xlsx
```

### Excel Report Contents

- **Query Details**: Original query, detected language, intent classification
- **Response Analysis**: Agent response, tool calls made, MCP data retrieved
- **Performance Metrics**: Processing time, success/failure status
- **Guardrail Results**: Moderation flags, PII detection
- **Summary Statistics**: Success rates, tool call rates, language distribution
- **Structured Data**: Extracted structured information from responses

---

## 🔧 Architecture

```
User Query
    ↓
Intent Classifier (intent-classifier.js)
    ↓
Guardrails (utils/guardrails.js) [OpenAI]
    ↓
Gemini Agent (utils/gemini-agent.js)
    ↓
Function Calling (utils/gemini-mcp-tool.js)
    ↓
MCP Tool Call Execution
    ↓
MCP Server (GAP/AccuWeather)
    ↓
Response Processing with Structured Data
    ↓
Excel Export (utils/excel-utils.js)
```

### Key Components

- **`batch-test-sdk.js`** - Main test orchestration script
- **`intent-classifier.js`** - Intent detection and language classification
- **`utils/process-query.js`** - Individual query processing logic
- **`utils/gemini-agent.js`** - Gemini client and content generation
- **`utils/gemini-mcp-tool.js`** - MCP tool declaration and execution
- **`utils/guardrails.js`** - Safety checks (uses OpenAI API)
- **`utils/excel-utils.js`** - Results export and analysis

---

## 🆚 Differences from OpenAI Version

| Aspect | OpenAI SDK | Gemini SDK |
|--------|------------|------------|
| **Model** | GPT-4o | Gemini 2.5 Flash |
| **Structured Data** | Limited | Native support |
| **Function Calling** | Agent Builder | Manual implementation |
| **Tool Execution** | Automatic | Manual with response handling |
| **Cost** | Higher | Lower |
| **Speed** | Moderate | Faster |
| **Guardrails** | Built-in | Uses OpenAI API |

### Structured Data Advantage

Gemini's structured data support enables:

- Better extraction of weather parameters
- More reliable intent classification
- Enhanced data analysis capabilities
- Improved response consistency

---

## 📈 Usage Examples

### Basic Testing

```bash
# Run default test (5 queries per language)
npm test
```

### Large-Scale Testing

```bash
# Run 100 queries per language (200 total)
npm run test:100
```

### Parallel Testing

Run both OpenAI and Gemini versions simultaneously:

```bash
# From parent directory
node compare-sdks.js --queries=10
```

---

## 🧪 Test Scenarios

### Weather Forecast Queries

- "What's the weather forecast for the next 5 days?"
- "Will it rain tomorrow?"
- "What's the temperature going to be?"

### Agricultural Advice

- "Should I plant maize now?"
- "When should I irrigate my crops?"
- "Is it a good time to apply fertilizer?"

### Multilingual Support

- English: "What's the weather forecast?"
- Swahili: "Hali ya hewa itakuaje kesho?"

---

## 📊 Performance Metrics

The framework tracks:

- **Success Rate**: Percentage of successful queries
- **Tool Call Rate**: Percentage of queries that triggered MCP tools
- **Data Retrieval Rate**: Percentage of successful MCP data retrievals
- **Average Response Time**: Mean processing time per query
- **Intent Classification Accuracy**: Correct intent detection rate
- **Language Detection Accuracy**: Correct language identification
- **Structured Data Extraction Rate**: Success rate of structured output parsing

---

## 🔒 Guardrails

### Moderation (via OpenAI)

- Content moderation via OpenAI Moderation API
- Automatic blocking of inappropriate content
- Safe response generation for blocked queries

### Jailbreak Detection

- Detection of prompt injection attempts
- Protection against system prompt manipulation
- Safe handling of adversarial inputs

### PII Detection

- Personal information detection
- Anonymization of sensitive data
- Privacy-preserving responses

**Note:** Guardrails use OpenAI API even though the main agent uses Gemini.

---

## 🔌 MCP Server Integration

### GAP Agriculture MCP Server

**Default Configuration:**
```javascript
MCP_SERVER_TYPE=GAP
GAP_MCP_URL=https://gap-agriculture-mcp-server.up.railway.app/mcp
```

**Tool:** `get_gap_weather_forecast`

**Coverage:** Kenya and East Africa

### AccuWeather MCP Server

**Configuration:**
```javascript
MCP_SERVER_TYPE=ACCUWEATHER
ACCUWEATHER_MCP_URL=https://accuweather-mcp-server.up.railway.app/mcp
```

**Tools:**
- `get_accuweather_weather_forecast` - 5-day forecast
- `get_accuweather_current_conditions` - Current weather

**Coverage:** Global

---

## 🛠️ Development

### Project Structure

```
gap-sdk-testing-gemini/
├── batch-test-sdk.js              # Main test script
├── intent-classifier.js           # Intent detection
├── intents.json                  # Intent definitions
├── utils/
│   ├── process-query.js          # Query processing
│   ├── gemini-agent.js          # Gemini client
│   ├── gemini-mcp-tool.js       # MCP tool integration
│   ├── guardrails.js            # Safety checks
│   ├── excel-utils.js           # Excel export
│   └── config.js               # Configuration
└── test-results/                # Generated reports
```

### Adding New Queries

Edit `utils/query-loader.js` to add new test queries.

### Customizing Prompts

Modify `utils/prompt-template.js` for agent behavior changes.

---

## 📊 Comparison Testing

This Gemini version can be run in parallel with the OpenAI version:

```bash
# From parent directory
node compare-sdks.js --queries=10
```

This enables:
- Side-by-side performance comparison
- Cost analysis
- Response quality evaluation
- Tool calling success rate comparison

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Related Projects

- **[GAP SDK Testing (OpenAI)](https://github.com/eagleisbatman/gap-sdk-testing)** - OpenAI SDK version
- **[GAP Agriculture MCP Server](https://github.com/eagleisbatman/gap-agriculture-mcp)** - Weather forecast MCP server
- **[TomorrowNow Decision Tree MCP Server](https://github.com/eagleisbatman/tomorrow-now-decision-tree-mcp-server)** - Crop advisory MCP server
- **[TomorrowNow GAP Platform](https://tomorrownow.org)** - Global Access Platform

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/eagleisbatman/gap-sdk-testing-gemini/issues)
- **Documentation**: See code comments and inline documentation
- **Gemini API**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **MCP Protocol**: [Model Context Protocol](https://modelcontextprotocol.io)

---

**Built with ❤️ for the TomorrowNow Global Access Platform**
