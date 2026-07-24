const ExcelJS = require('exceljs');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

class LoadTestReportGenerator {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
  }

  async generateReport(results) {
    const reportDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const worksheet = this.workbook.addWorksheet('Load Test Analysis');
    this.setupAnalysisSheet(worksheet, results);

    const filename = `load-test-report-${moment().format('YYYY-MM-DD-HH-mm-ss')}.xlsx`;
    const filepath = path.join(reportDir, filename);
    await this.workbook.xlsx.writeFile(filepath);
    return filepath;
  }

  setupAnalysisSheet(ws, results) {
    // Title
    ws.mergeCells('A1:E1');
    ws.getCell('A1').value = 'EHR SYSTEM - LOAD TEST PERFORMANCE ANALYSIS';
    ws.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6C757D' } };
    ws.getCell('A1').alignment = { horizontal: 'center' };

    ws.addRow([]);
    ws.addRow(['TEST PARAMETERS']).font = { bold: true };
    ws.addRow(['Target URL', results.url]);
    ws.addRow(['Concurrent Users (VUs)', results.connections]);
    ws.addRow(['Test Duration', results.duration + ' seconds']);
    ws.addRow(['Timestamp', moment().format('YYYY-MM-DD HH:mm:ss')]);
    ws.addRow([]);

    // Throughput Stats
    ws.addRow(['THROUGHPUT (RPS)']).font = { bold: true };
    const throughputHeader = ws.addRow(['Average RPS', 'Max RPS', 'Total Requests', 'Total Data Received']);
    throughputHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } };
    ws.addRow([
      results.requests.average,
      results.requests.max,
      results.requests.total,
      (results.throughput.total / 1024 / 1024).toFixed(2) + ' MB'
    ]);
    ws.addRow([]);

    // Latency Stats
    ws.addRow(['LATENCY / RESPONSE TIME (ms)']).font = { bold: true };
    const latencyHeader = ws.addRow(['Average (Mean)', 'Min', 'Max', 'P50 (Median)', 'P95', 'P99']);
    latencyHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
    ws.addRow([
      results.latency.average,
      results.latency.min,
      results.latency.max,
      results.latency.p50,
      results.latency.p95,
      results.latency.p99
    ]);
    ws.addRow([]);

    // HTTP Status Codes
    ws.addRow(['HTTP STATUS CODES']).font = { bold: true };
    const statusHeader = ws.addRow(['Status Code', 'Count']);
    statusHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
    ws.addRow(['2xx Success', results['2xx'] || 0]);
    ws.addRow(['3xx Redirection', results['3xx'] || 0]);
    ws.addRow(['4xx Client Error', results['4xx'] || 0]);
    ws.addRow(['5xx Server Error', results['5xx'] || 0]);

    // Formatting
    ws.columns = [
      { width: 25 }, { width: 20 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
    ];
  }
}

module.exports = LoadTestReportGenerator;
