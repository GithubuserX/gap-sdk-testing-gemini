import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DEFAULT_FARMER_CONTEXT, KENYA_COORDINATES } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Calculate summary statistics for results
 */
function calculateSummary(results, language) {
  const totalQueries = results.length;
  const successfulQueries = results.filter(r => r.status === 'success').length;
  const gapMcpCalledCount = results.filter(r => r.gapMcpCalled).length;
  const mcpDataRetrievedCount = results.filter(r => r.mcpDataRetrieved).length;
  const guardrailBlockedCount = results.filter(r => r.status === 'guardrail_blocked').length;
  const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTimeMs, 0) / results.length;
  const totalProcessingTime = results.reduce((sum, r) => sum + r.processingTimeMs, 0);
  const totalProcessingTimeSeconds = (totalProcessingTime / 1000).toFixed(2);

  return [
    { 'Metric': `Language: ${language}`, 'Value': '' },
    { 'Metric': 'Total Queries', 'Value': totalQueries },
    { 'Metric': 'Successful Queries', 'Value': successfulQueries },
    { 'Metric': 'Failed Queries', 'Value': totalQueries - successfulQueries },
    { 'Metric': 'Guardrail Blocked', 'Value': guardrailBlockedCount },
    { 'Metric': 'GAP MCP Called', 'Value': gapMcpCalledCount },
    { 'Metric': 'GAP MCP Not Called', 'Value': totalQueries - gapMcpCalledCount },
    { 'Metric': 'GAP MCP Success Rate', 'Value': `${((gapMcpCalledCount / totalQueries) * 100).toFixed(1)}%` },
    { 'Metric': 'MCP Data Retrieved', 'Value': mcpDataRetrievedCount },
    { 'Metric': 'MCP Data NOT Retrieved', 'Value': gapMcpCalledCount - mcpDataRetrievedCount },
    { 'Metric': 'MCP Data Retrieval Rate', 'Value': gapMcpCalledCount > 0 ? `${((mcpDataRetrievedCount / gapMcpCalledCount) * 100).toFixed(1)}%` : '0%' },
    { 'Metric': 'Average Processing Time (ms)', 'Value': Math.round(avgProcessingTime) },
    { 'Metric': 'Average Processing Time (seconds)', 'Value': parseFloat((avgProcessingTime / 1000).toFixed(2)) },
    { 'Metric': 'Total Processing Time (ms)', 'Value': Math.round(totalProcessingTime) },
    { 'Metric': 'Total Processing Time (seconds)', 'Value': parseFloat(totalProcessingTimeSeconds) },
    { 'Metric': '', 'Value': '' } // Empty row separator
  ];
}

/**
 * Export results to Excel file
 */
export function exportToExcel(englishResults, swahiliResults, filename, farmerContext = DEFAULT_FARMER_CONTEXT) {
  // Create test-results directory if it doesn't exist
  const resultsDir = path.join(__dirname, '..', 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const filePath = path.join(resultsDir, filename);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Helper function to prepare worksheet data
  const prepareWorksheetData = (results) => {
    return results.map((result, index) => ({
      'Query #': index + 1,
      'Query': result.query,
      'Response': result.response,
      'Intent': result.intent || 'none',
      'Intent Confidence': result.intentConfidence || 0,
      'Detected Language': result.detectedLanguage || 'en',
      'Country': result.country || 'kenya',
      'GAP MCP Called': result.gapMcpCalled ? 'YES' : 'NO',
      'Tool Name': result.toolName || 'N/A',
      'Server Label': result.serverLabel || 'N/A',
      'MCP Data Retrieved': result.gapMcpCalled ? (result.mcpDataRetrieved ? 'YES ✅' : 'NO ❌') : 'N/A',
      'MCP Response': (result.mcpResponse && typeof result.mcpResponse === 'string') ? result.mcpResponse.substring(0, 500) + (result.mcpResponse.length > 500 ? '...' : '') : 'N/A',
      'Details': result.details,
      'Processing Time (ms)': result.processingTimeMs,
      'Processing Time (seconds)': result.processingTimeSeconds,
      'Tool Calls Count': result.toolCallsCount,
      'Status': result.status,
      'Timestamp': result.timestamp
    }));
  };

  // Column widths
  const columnWidths = [
    { wch: 8 },   // Query #
    { wch: 50 },  // Query
    { wch: 80 },  // Response
    { wch: 15 },  // GAP MCP Called
    { wch: 25 },  // Tool Name
    { wch: 30 },  // Server Label
    { wch: 20 },  // MCP Data Retrieved
    { wch: 50 },  // MCP Response
    { wch: 30 },  // Details
    { wch: 20 },  // Processing Time (ms)
    { wch: 20 },  // Processing Time (seconds)
    { wch: 15 },  // Tool Calls Count
    { wch: 15 },  // Status
    { wch: 25 }   // Timestamp
  ];

  // Add English results sheet
  if (englishResults && englishResults.length > 0) {
    const englishWorksheet = XLSX.utils.json_to_sheet(prepareWorksheetData(englishResults));
    englishWorksheet['!cols'] = columnWidths;
    XLSX.utils.book_append_sheet(workbook, englishWorksheet, 'English Results');
  }

  // Add Swahili results sheet
  if (swahiliResults && swahiliResults.length > 0) {
    const swahiliWorksheet = XLSX.utils.json_to_sheet(prepareWorksheetData(swahiliResults));
    swahiliWorksheet['!cols'] = columnWidths;
    XLSX.utils.book_append_sheet(workbook, swahiliWorksheet, 'Swahili Results');
  }

  // Add summary sheet
  const summaryData = [
    { 'Metric': 'Farmer Information', 'Value': '' },
    { 'Metric': 'Name', 'Value': farmerContext.fullName },
    { 'Metric': 'Location', 'Value': farmerContext.location },
    { 'Metric': 'Farm Size', 'Value': farmerContext.farmSize },
    { 'Metric': 'Primary Crops', 'Value': Array.isArray(farmerContext.primaryCrops) ? farmerContext.primaryCrops.join(', ') : farmerContext.primaryCrops },
    { 'Metric': 'Experience', 'Value': farmerContext.experience },
    { 'Metric': '', 'Value': '' }, // Empty row separator
    ...calculateSummary(englishResults || [], 'English'),
    ...calculateSummary(swahiliResults || [], 'Swahili'),
    { 'Metric': 'Test Information', 'Value': '' },
    { 'Metric': 'Test Date', 'Value': new Date().toISOString() },
    { 'Metric': 'Test Coordinates', 'Value': `Lat: ${KENYA_COORDINATES.latitude}, Lon: ${KENYA_COORDINATES.longitude}` },
    { 'Metric': 'Location Type', 'Value': KENYA_COORDINATES.locationType }
  ];

  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
  summaryWorksheet['!cols'] = [
    { wch: 30 },
    { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

  // Write file
  XLSX.writeFile(workbook, filePath);
  return filePath;
}

/**
 * Print summary statistics to console
 */
export function printSummary(results, language) {
  const totalQueries = results.length;
  const successfulQueries = results.filter(r => r.status === 'success').length;
  const gapMcpCalledCount = results.filter(r => r.gapMcpCalled).length;
  const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTimeMs, 0) / results.length;
  const mcpDataRetrievedCount = results.filter(r => r.mcpDataRetrieved).length;
  const guardrailBlockedCount = results.filter(r => r.status === 'guardrail_blocked').length;
  const totalProcessingTime = results.reduce((sum, r) => sum + r.processingTimeMs, 0);
  const totalProcessingTimeSeconds = (totalProcessingTime / 1000).toFixed(2);
  
  console.log(`\n${language} Results:`);
  console.log(`  Total Queries: ${totalQueries}`);
  console.log(`  Successful: ${successfulQueries} (${((successfulQueries / totalQueries) * 100).toFixed(1)}%)`);
  console.log(`  Failed: ${totalQueries - successfulQueries}`);
  console.log(`  Guardrail Blocked: ${guardrailBlockedCount}`);
  console.log(`  GAP MCP Called: ${gapMcpCalledCount} (${((gapMcpCalledCount / totalQueries) * 100).toFixed(1)}%)`);
  console.log(`  GAP MCP Not Called: ${totalQueries - gapMcpCalledCount}`);
  console.log(`  MCP Data Retrieved: ${mcpDataRetrievedCount} (${gapMcpCalledCount > 0 ? ((mcpDataRetrievedCount / gapMcpCalledCount) * 100).toFixed(1) : 0}% of calls)`);
  console.log(`  MCP Data NOT Retrieved: ${gapMcpCalledCount - mcpDataRetrievedCount}`);
  console.log(`  Average Processing Time: ${Math.round(avgProcessingTime)}ms (${(avgProcessingTime / 1000).toFixed(2)}s)`);
  console.log(`  Total Processing Time: ${Math.round(totalProcessingTime)}ms (${totalProcessingTimeSeconds}s)`);
}

