const ExcelJS = require('exceljs');
const moment = require('moment');
const path = require('path');
const fs = require('fs');

class SeleniumReportGenerator {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.results = [];
  }

  addResults(results) {
    this.results = [...this.results, ...results];
  }

  async generateReport() {
    const reportDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const worksheet = this.workbook.addWorksheet('Test Results');
    const analysisSheet = this.workbook.addWorksheet('Analysis Dashboard');

    this.setupResultsSheet(worksheet);
    this.setupAnalysisSheet(analysisSheet);

    const filename = `selenium-web-report-${moment().format('YYYY-MM-DD-HH-mm-ss')}.xlsx`;
    const filepath = path.join(reportDir, filename);
    await this.workbook.xlsx.writeFile(filepath);
    return filepath;
  }

  setupResultsSheet(ws) {
    ws.mergeCells('A1:I1');
    ws.getCell('A1').value = 'EHR WEB APPLICATION - SELENIUM END-TO-END TEST REPORT';
    ws.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF28A745' } };
    ws.getCell('A1').alignment = { horizontal: 'center' };

    const header = ws.addRow(['#', 'Test ID', 'Test Name', 'Status', 'Duration (ms)', 'Error Message', 'Category', 'Browser', 'Timestamp']);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } };

    this.results.forEach((r, i) => {
      const row = ws.addRow([
        i + 1,
        r.testId,
        r.testName,
        r.status,
        r.duration,
        r.error || '-',
        r.category,
        'Chrome',
        moment().format('HH:mm:ss')
      ]);

      const statusCell = row.getCell(4);
      if (r.status === 'PASSED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
        statusCell.font = { color: { argb: 'FF006100' }, bold: true };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
        statusCell.font = { color: { argb: 'FF9C0006' }, bold: true };
      }
    });

    ws.columns = [
      { width: 5 }, { width: 12 }, { width: 45 }, { width: 12 }, { width: 15 }, { width: 40 }, { width: 20 }, { width: 12 }, { width: 15 }
    ];
  }

  setupAnalysisSheet(ws) {
    ws.mergeCells('A1:E1');
    ws.getCell('A1').value = 'SELENIUM WEB TEST ANALYSIS DASHBOARD';
    ws.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF007BFF' } };
    ws.getCell('A1').alignment = { horizontal: 'center' };

    ws.addRow([]);
    ws.addRow(['Module Category', 'Total', 'Passed', 'Failed', 'Success Rate']).font = { bold: true };

    const stats = {};
    this.results.forEach(r => {
      if (!stats[r.category]) stats[r.category] = { total: 0, passed: 0, failed: 0 };
      stats[r.category].total++;
      if (r.status === 'PASSED') stats[r.category].passed++;
      else stats[r.category].failed++;
    });

    Object.keys(stats).forEach(cat => {
      const s = stats[cat];
      const rate = ((s.passed / s.total) * 100).toFixed(2) + '%';
      ws.addRow([cat, s.total, s.passed, s.failed, rate]);
    });

    ws.addRow([]);
    ws.addRow(['OVERALL SUMMARY']).font = { bold: true };
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    ws.addRow(['Total Test Cases', total]);
    ws.addRow(['Total Passed', passed]);
    ws.addRow(['Total Failed', total - passed]);
    ws.addRow(['Overall Success Rate', ((passed / total) * 100).toFixed(2) + '%']);

    ws.columns = [{ width: 30 }, { width: 15 }, { width: 12 }, { width: 12 }, { width: 15 }];
  }
}

module.exports = SeleniumReportGenerator;
