import ExcelJS from 'exceljs';
import moment from 'moment';
import path from 'path';
import fs from 'fs';
import { appiumConfig } from '../../config/appiumConfig';

/**
 * Excel Report Generator for Appium Test Results
 */
export class ExcelReportGenerator {
  private workbook: ExcelJS.Workbook;
  private worksheet: ExcelJS.Worksheet;
  private testResults: any[] = [];
  private deviceInfo: any;

  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.worksheet = this.workbook.addWorksheet('Test Results');
    this.setupWorksheet();
  }

  /**
   * Setup worksheet with headers and formatting
   */
  private setupWorksheet(): void {
    // Add title
    const titleCell = this.worksheet.mergeCells('A1:H1');
    titleCell.value = 'EHR Mobile Application - Appium E2E Test Report';
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF208AEF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'center' };
    this.worksheet.getRow(1).height = 25;

    // Add timestamp
    const timestampCell = this.worksheet.mergeCells('A2:H2');
    timestampCell.value = `Report Generated: ${moment().format('YYYY-MM-DD HH:mm:ss')}`;
    timestampCell.font = { size: 11, italic: true };
    timestampCell.alignment = { horizontal: 'center' };

    // Add empty row
    this.worksheet.addRow([]);

    // Add headers
    const headerRow = this.worksheet.addRow([
      '#',
      'Test ID',
      'Test Name',
      'Status',
      'Duration (ms)',
      'Error Message',
      'Category',
      'Date',
      'Time',
    ]);

    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'center' };

    // Set column widths
    this.worksheet.columns = [
      { width: 5 },
      { width: 12 },
      { width: 45 },
      { width: 12 },
      { width: 15 },
      { width: 45 },
      { width: 18 },
      { width: 15 },
      { width: 12 },
    ];
  }

  /**
   * Add test results to report
   */
  addTestResults(results: any[], category: string): void {
    this.testResults.push({
      category,
      results,
    });
  }

  /**
   * Set device information
   */
  setDeviceInfo(deviceInfo: any): void {
    this.deviceInfo = deviceInfo;
  }

  /**
   * Generate the report
   */
  generateReport(): void {
    let testNumber = 1;

    for (const resultGroup of this.testResults) {
      for (const test of resultGroup.results) {
        const row = this.worksheet.addRow([
          testNumber,
          test.testId || `TC-${String(testNumber).padStart(3, '0')}`,
          test.testName,
          test.status,
          test.duration,
          test.error || '-',
          resultGroup.category,
          moment().format('YYYY-MM-DD'),
          moment().format('HH:mm:ss'),
        ]);

        // Color code based on status
        const statusCell = row.getCell(4);
        if (test.status === 'PASSED') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
          statusCell.font = { color: { argb: 'FF006100' }, bold: true };
        } else {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
          statusCell.font = { color: { argb: 'FF9C0006' }, bold: true };
        }

        // Center align
        row.eachCell((cell) => {
          cell.alignment = { horizontal: 'left', vertical: 'center', wrapText: true };
        });

        testNumber++;
      }
    }

    // Add summary section
    this.addSummary();
    
    // Add Analysis Sheet
    this.addAnalysisSheet();

    // Add device info sheet
    this.addDeviceInfoSheet();
  }

  /**
   * Add Analysis Sheet with categorical breakdown
   */
  private addAnalysisSheet(): void {
    const analysisSheet = this.workbook.addWorksheet('Test Analysis');

    // Title
    const titleCell = analysisSheet.mergeCells('A1:E1');
    titleCell.value = 'EHR Mobile - Comprehensive Test Analysis';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF208AEF' } };
    titleCell.alignment = { horizontal: 'center' };

    analysisSheet.addRow([]);

    // Category Breakdown Headers
    const headers = analysisSheet.addRow(['Category', 'Total', 'Passed', 'Failed', 'Pass Rate (%)']);
    headers.font = { bold: true };
    headers.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } };

    // Calculate per category
    const stats: { [key: string]: { total: number, passed: number, failed: number } } = {};

    for (const group of this.testResults) {
      if (!stats[group.category]) {
        stats[group.category] = { total: 0, passed: 0, failed: 0 };
      }
      for (const test of group.results) {
        stats[group.category].total++;
        if (test.status === 'PASSED') stats[group.category].passed++;
        else stats[group.category].failed++;
      }
    }

    // Add rows for each category
    Object.keys(stats).forEach(cat => {
      const s = stats[cat];
      const passRate = ((s.passed / s.total) * 100).toFixed(2);
      const row = analysisSheet.addRow([cat, s.total, s.passed, s.failed, passRate]);

      // Highlight failures
      if (s.failed > 0) {
        row.getCell(4).font = { color: { argb: 'FFFF0000' }, bold: true };
      }
    });

    analysisSheet.columns = [
      { width: 25 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 15 }
    ];

    // Add Duration Analysis
    analysisSheet.addRow([]);
    analysisSheet.addRow([]);
    const durationTitle = analysisSheet.mergeCells(`A${analysisSheet.rowCount + 1}:E${analysisSheet.rowCount + 1}`);
    analysisSheet.getCell(`A${analysisSheet.rowCount}`).value = 'Duration Analysis';
    analysisSheet.getCell(`A${analysisSheet.rowCount}`).font = { bold: true };

    const avgDuration = this.calculateAverageDuration();
    analysisSheet.addRow(['Average Test Duration:', `${avgDuration.toFixed(2)} ms`]);
    analysisSheet.addRow(['Slowest Test:', this.getSlowestTest().name, `${this.getSlowestTest().duration} ms`]);
    analysisSheet.addRow(['Fastest Test:', this.getFastestTest().name, `${this.getFastestTest().duration} ms`]);
  }

  private calculateAverageDuration(): number {
    let total = 0;
    let count = 0;
    this.testResults.forEach(g => g.results.forEach((t: any) => { total += t.duration; count++; }));
    return count > 0 ? total / count : 0;
  }

  private getSlowestTest(): any {
    let slowest = { name: 'N/A', duration: 0 };
    this.testResults.forEach(g => g.results.forEach((t: any) => {
      if (t.duration > slowest.duration) slowest = { name: t.testName, duration: t.duration };
    }));
    return slowest;
  }

  private getFastestTest(): any {
    let fastest = { name: 'N/A', duration: Infinity };
    this.testResults.forEach(g => g.results.forEach((t: any) => {
      if (t.duration < fastest.duration) fastest = { name: t.testName, duration: t.duration };
    }));
    return fastest === Infinity ? { name: 'N/A', duration: 0 } : fastest;
  }

  /**
   * Add summary statistics
   */
  private addSummary(): void {
    // Add empty rows
    this.worksheet.addRow([]);
    this.worksheet.addRow([]);

    // Count results
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let totalDuration = 0;

    for (const resultGroup of this.testResults) {
      for (const test of resultGroup.results) {
        totalTests++;
        if (test.status === 'PASSED') {
          passedTests++;
        } else {
          failedTests++;
        }
        totalDuration += test.duration;
      }
    }

    const summaryRow1 = this.worksheet.addRow(['SUMMARY STATISTICS', '', '', '', '', '', '', '']);
    summaryRow1.font = { bold: true, size: 12 };
    summaryRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } };

    this.worksheet.addRow(['Total Tests:', totalTests, '', '', '', '', '', '']);
    this.worksheet.addRow(['Passed:', passedTests, '', '', '', '', '', '']);
    this.worksheet.addRow(['Failed:', failedTests, '', '', '', '', '', '']);
    this.worksheet.addRow(['Success Rate:', `${((passedTests / totalTests) * 100).toFixed(2)}%`, '', '', '', '', '', '']);
    this.worksheet.addRow(['Total Duration:', `${totalDuration}ms`, '', '', '', '', '', '']);
  }

  /**
   * Add device information sheet
   */
  private addDeviceInfoSheet(): void {
    const deviceSheet = this.workbook.addWorksheet('Device Info');

    // Add headers
    deviceSheet.columns = [
      { width: 30 },
      { width: 50 },
    ];

    const titleCell = deviceSheet.mergeCells('A1:B1');
    titleCell.value = 'Device Information';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF208AEF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'center' };
    deviceSheet.getRow(1).height = 20;

    deviceSheet.addRow([]);

    // Add device info
    deviceSheet.addRow(['Device Name:', this.deviceInfo?.deviceName || appiumConfig.deviceName]);
    deviceSheet.addRow(['Platform:', appiumConfig.platformName]);
    deviceSheet.addRow(['Platform Version:', this.deviceInfo?.platformVersion || appiumConfig.platformVersion]);
    deviceSheet.addRow(['Automation Name:', appiumConfig.automationName]);
    deviceSheet.addRow(['App Package:', appiumConfig.appPackage]);
    deviceSheet.addRow(['App Activity:', appiumConfig.appActivity]);
    deviceSheet.addRow(['Test Timeout:', `${appiumConfig.testTimeout}ms`]);
    deviceSheet.addRow(['Implicit Wait:', `${appiumConfig.implicitWaitTimeout}ms`]);
    deviceSheet.addRow(['Report Generated:', moment().format('YYYY-MM-DD HH:mm:ss')]);

    // Style all data cells
    for (let i = 3; i <= 11; i++) {
      const row = deviceSheet.getRow(i);
      const keyCell = row.getCell(1);
      keyCell.font = { bold: true };
      keyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } };
    }
  }

  /**
   * Save report to file
   */
  async saveReport(filename?: string): Promise<string> {
    try {
      // Create reports directory if it doesn't exist
      const reportDir = appiumConfig.reportOutputPath;
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const reportName =
        filename || `${appiumConfig.reportFilename}-${moment().format('YYYY-MM-DD-HH-mm-ss')}.xlsx`;
      const reportPath = path.join(reportDir, reportName);

      await this.workbook.xlsx.writeFile(reportPath);
      console.log(`\n📊 Excel Report saved successfully: ${reportPath}`);
      return reportPath;
    } catch (error) {
      console.error('❌ Failed to save Excel report:', error);
      throw error;
    }
  }
}

export default ExcelReportGenerator;
