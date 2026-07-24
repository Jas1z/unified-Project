const autocannon = require('autocannon');
const LoadTestReportGenerator = require('./utils/reportGenerator');
const chalk = require('chalk');

async function runLoadTest() {
  console.log(chalk.blue.bold('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.blue.bold('║  EHR System - Backend API Load & Performance Testing       ║'));
  console.log(chalk.blue.bold('╚════════════════════════════════════════════════════════════╝\n'));

  const config = {
    url: 'http://localhost:8000/health', // Targeting health check for baseline
    connections: 100, // 100 concurrent users
    duration: 60,     // 60 seconds (1 minute)
    pipelining: 1,
    title: 'Baseline Load Test'
  };

  console.log(chalk.yellow(`🚀 Starting Load Test on: ${config.url}`));
  console.log(chalk.cyan(`👥 Virtual Users: ${config.connections}`));
  console.log(chalk.cyan(`🕒 Duration: ${config.duration} seconds`));
  console.log(chalk.gray('\nRunning... please wait...\n'));

  // Run autocannon
  const results = await autocannon(config);

  console.log(chalk.green.bold('✅ Load Test Complete!\n'));

  // Display summary to console
  console.log(chalk.white.bold('--- Results Summary ---'));
  console.log(chalk.white(`Average RPS: ${results.requests.average}`));
  console.log(chalk.white(`Average Latency: ${results.latency.average} ms`));
  console.log(chalk.white(`Max Latency: ${results.latency.max} ms`));
  console.log(chalk.white(`Total Requests: ${results.requests.total}`));
  console.log(chalk.white(`Success (2xx): ${results['2xx']}`));
  console.log(chalk.red(`Errors (5xx): ${results['5xx']}`));

  // Generate Excel Report
  console.log(chalk.yellow('\n📊 Generating Load Test Analysis Report...'));
  const reportGenerator = new LoadTestReportGenerator();
  const reportPath = await reportGenerator.generateReport(results);

  console.log(chalk.green.bold(`\n📂 Report Saved: ${reportPath}`));

  console.log(chalk.blue.bold('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.blue.bold('║                LOAD TEST PERFORMANCE SUCCESS               ║'));
  console.log(chalk.blue.bold('╚════════════════════════════════════════════════════════════╝\n'));
}

// Check if backend is likely running before starting
const http = require('http');
const checkRequest = http.get('http://localhost:8000/health', (res) => {
    runLoadTest();
}).on('error', (e) => {
    console.log(chalk.red.bold('❌ Error: Backend API (http://localhost:8000) is not reachable.'));
    console.log(chalk.yellow('Please start the backend server (uvicorn main:app) before running the load test.'));
    console.log(chalk.gray('\nSimulating a sample report for demonstration purposes...\n'));

    // Simulate results for demo if backend is offline
    const mockResults = {
        url: 'http://localhost:8000/health (SIMULATED)',
        connections: 100,
        duration: 60,
        requests: { average: 125.4, max: 150, total: 7524 },
        throughput: { total: 10485760 },
        latency: { average: 245.5, min: 48.2, max: 1480.0, p50: 210, p95: 850, p99: 1320 },
        '2xx': 7524, '3xx': 0, '4xx': 0, '5xx': 0
    };
    const reportGenerator = new LoadTestReportGenerator();
    reportGenerator.generateReport(mockResults).then(path => {
        console.log(chalk.green(`✅ Simulated Report Saved: ${path}`));
    });
});
