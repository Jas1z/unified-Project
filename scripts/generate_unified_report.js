const fs = require('fs');
const path = require('path');

const APP_NAME = 'CareNexus';

function humanSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(2)} ${units[i]}`;
}

function walk(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) files = files.concat(walk(p));
    else files.push(p);
  }
  return files;
}

function latestFile(dir, extensions = ['.xlsx', '.txt']) {
  const files = walk(dir).filter((f) => extensions.some((ext) => f.endsWith(ext)));
  if (!files.length) return null;
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0];
}

function readSummary(searchDirs) {
  for (const dir of searchDirs) {
    const file = path.join(dir, 'ci-summary.json');
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  }
  return null;
}

function pct(passed, total) {
  if (!total) return '0%';
  return `${((passed / total) * 100).toFixed(total === passed ? 0 : 1)}%`;
}

function loadSummaries() {
  const root = process.cwd();
  return {
    website: readSummary([
      path.join(root, 'artifacts', 'selenium'),
      path.join(root, 'selenium-tests', 'reports'),
    ]),
    mobile: readSummary([
      path.join(root, 'artifacts', 'mobile'),
      path.join(root, 'appium-tests', 'reports'),
    ]),
    security: readSummary([
      path.join(root, 'artifacts', 'backend'),
      path.join(root, 'Unified-Secure-Patient-Record-System', 'reports'),
    ]),
    load: readSummary([
      path.join(root, 'artifacts', 'load'),
      path.join(root, 'load-tests', 'reports'),
    ]),
  };
}

function artifactLinks(summaries) {
  const root = process.cwd();
  const links = [];

  const add = (label, summary, artifactDir) => {
    const fileName = summary?.reportFile;
    const resolved = fileName
      ? walk(path.join(root, artifactDir)).find((f) => path.basename(f) === fileName)
      : latestFile(path.join(root, artifactDir));
    if (resolved) {
      links.push({ label, path: path.relative(root, resolved).replace(/\\/g, '/') });
    }
  };

  add('Website E2E Report', summaries.website, 'artifacts/selenium');
  add('Mobile E2E Report', summaries.mobile, 'artifacts/mobile');
  add('Backend Security Report', summaries.security, 'artifacts/backend');
  add('Load Testing Report', summaries.load, 'artifacts/load');

  return links;
}

function buildOverviewRows(summaries) {
  const rows = [];

  if (summaries.website) {
    rows.push({
      component: '🌐 Website E2E',
      suite: summaries.website.suite,
      total: summaries.website.total,
      passedLabel: '✅ Passed',
      passed: summaries.website.passed,
      failedLabel: '❌ Failed',
      failed: summaries.website.failed,
      rate: pct(summaries.website.passed, summaries.website.total),
      duration: `${summaries.website.durationSeconds || 0}s`,
    });
  }

  if (summaries.mobile) {
    rows.push({
      component: '📱 Mobile E2E',
      suite: summaries.mobile.suite,
      total: summaries.mobile.total,
      passedLabel: '✅ Passed',
      passed: summaries.mobile.passed,
      failedLabel: '❌ Failed',
      failed: summaries.mobile.failed,
      rate: pct(summaries.mobile.passed, summaries.mobile.total),
      duration: `${summaries.mobile.durationSeconds || 0}s`,
    });
  }

  if (summaries.security) {
    rows.push({
      component: '🔒 Backend Security',
      suite: summaries.security.suite,
      total: summaries.security.total,
      passedLabel: '✅ Fixed',
      passed: summaries.security.fixed ?? summaries.security.passed,
      failedLabel: '📋 Open',
      failed: summaries.security.open ?? summaries.security.failed,
      rate: pct(summaries.security.fixed ?? summaries.security.passed, summaries.security.total),
      duration: 'N/A',
    });
  }

  if (summaries.load) {
    rows.push({
      component: '⚡ API Load Testing',
      suite: summaries.load.suite,
      total: summaries.load.total,
      passedLabel: '✅ Passed',
      passed: summaries.load.passed,
      failedLabel: '❌ Failed',
      failed: summaries.load.failed,
      rate: pct(summaries.load.passed, summaries.load.total),
      duration: `${summaries.load.durationSeconds || 0}s`,
    });
  }

  return rows;
}

function buildStepSummary(summaries, links) {
  const rows = buildOverviewRows(summaries);
  const lines = [];

  lines.push(`# 🧪 ${APP_NAME} Unified Test Verification Dashboard`);
  lines.push('');
  lines.push(
    `This dashboard presents a unified summary of E2E tests, security scans, and API load testing across all major components: **Website**, **Mobile App**, **Backend**, and **APIs**.`,
  );
  lines.push('');
  lines.push('## Unified Summary Overview');
  lines.push('');
  lines.push('| Component | Test Suite / Report | Total Tests | Passed / Fixed | Failed / Open | Pass/Fix Rate | Duration |');
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |');

  for (const row of rows) {
    lines.push(
      `| ${row.component} | ${row.suite} | ${row.total} | ${row.passed} | ${row.failed} | ${row.rate} | ${row.duration} |`,
    );
  }

  if (summaries.website) {
    lines.push('');
    lines.push('## 🌐 Website E2E Test Verification Details');
    lines.push('');
    lines.push('<details>');
    lines.push(`<summary>Click to view Website E2E Test Cases (${summaries.website.total} tests)</summary>`);
    lines.push('');
    for (const test of summaries.website.sampleTests || []) {
      lines.push(`- \`${test.id}\` — ${test.name} — **${test.status}**`);
    }
    lines.push('</details>');
  }

  if (summaries.mobile) {
    lines.push('');
    lines.push('## 📱 Mobile App E2E Test Verification Details');
    lines.push('');
    lines.push('<details>');
    lines.push(`<summary>Click to view Mobile E2E Test Cases (${summaries.mobile.total} tests)</summary>`);
    lines.push('');
    for (const test of summaries.mobile.sampleTests || []) {
      lines.push(`- \`${test.id}\` — ${test.name} — **${test.status}**`);
    }
    lines.push('</details>');
  }

  if (summaries.security) {
    const sev = summaries.security.severity || {};
    lines.push('');
    lines.push('## 🔒 Backend Security Scan Details');
    lines.push('');
    lines.push('**Severity Breakdown:**');
    lines.push('');
    lines.push(`- 🔴 Critical: ${sev.critical ?? 0}`);
    lines.push(`- 🟠 High: ${sev.high ?? 0}`);
    lines.push(`- 🟡 Medium: ${sev.medium ?? 0}`);
    lines.push(`- 🔵 Low: ${sev.low ?? 0}`);
    lines.push('');
    lines.push('<details>');
    lines.push(`<summary>Click to view Backend Security Findings (${summaries.security.total} findings)</summary>`);
    lines.push('');
    for (const finding of summaries.security.sampleFindings || []) {
      lines.push(`- \`${finding.id}\` [${finding.severity}] ${finding.title} — **${finding.status}**`);
    }
    lines.push('</details>');
  }

  if (summaries.load) {
    lines.push('');
    lines.push('## ⚡ API Load Testing Details');
    lines.push('');
    lines.push(`**Test Configuration:** Concurrency: ${summaries.load.concurrency || 100} VUs • Duration: ${summaries.load.durationSeconds || 60}s per scenario`);
    if (summaries.load.simulated) {
      lines.push('');
      lines.push('_Note: Simulated load test data was used because the backend was unavailable during this run._');
    }
    lines.push('');
    lines.push('<details>');
    lines.push('<summary>Click to view API Load Testing Scenarios</summary>');
    lines.push('');
    for (const scenario of summaries.load.scenarios || []) {
      lines.push(`- ${scenario.name} — \`${scenario.url}\` — ${scenario.requests} requests — **${scenario.status}**`);
    }
    if (summaries.load.metrics) {
      lines.push('');
      lines.push(`- Average RPS: ${summaries.load.metrics.averageRps}`);
      lines.push(`- Average Latency: ${summaries.load.metrics.averageLatencyMs} ms`);
      lines.push(`- Max Latency: ${summaries.load.metrics.maxLatencyMs} ms`);
    }
    lines.push('</details>');
  }

  lines.push('');
  lines.push('## 📦 Test Report Artifacts');
  lines.push('');
  lines.push('The full test report files are uploaded as part of this workflow run and can be inspected in the artifacts list:');
  lines.push('');
  for (const link of links) {
    lines.push(`- **${link.label}:** \`${link.path}\``);
  }

  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  return lines.join('\n');
}

function buildHtmlDashboard(summaries, links) {
  const rows = buildOverviewRows(summaries);
  const html = [];
  html.push('<!doctype html><html><head><meta charset="utf-8"><title>Unified Test Dashboard</title>');
  html.push('<style>');
  html.push('body{font-family:Segoe UI,Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:24px}');
  html.push('h1,h2{color:#f8fafc}table{width:100%;border-collapse:collapse;margin:16px 0}');
  html.push('th,td{padding:12px;border:1px solid #334155;text-align:left}th{background:#1e293b}');
  html.push('tr:nth-child(even){background:#111827}.card{background:#1e293b;border-radius:12px;padding:16px;margin:16px 0}');
  html.push('code{background:#0b1220;padding:2px 6px;border-radius:4px}');
  html.push('</style></head><body>');
  html.push(`<h1>🧪 ${APP_NAME} Unified Test Verification Dashboard</h1>`);
  html.push(`<p>Generated: ${new Date().toISOString()}</p>`);
  html.push('<div class="card"><h2>Unified Summary Overview</h2><table>');
  html.push('<thead><tr><th>Component</th><th>Suite</th><th>Total</th><th>Passed/Fixed</th><th>Failed/Open</th><th>Rate</th><th>Duration</th></tr></thead><tbody>');
  for (const row of rows) {
    html.push(`<tr><td>${row.component}</td><td>${row.suite}</td><td>${row.total}</td><td>${row.passed}</td><td>${row.failed}</td><td>${row.rate}</td><td>${row.duration}</td></tr>`);
  }
  html.push('</tbody></table></div>');
  html.push('<div class="card"><h2>Report Artifacts</h2><ul>');
  for (const link of links) {
    html.push(`<li><strong>${link.label}</strong>: <code>${link.path}</code></li>`);
  }
  html.push('</ul></div></body></html>');
  return html.join('\n');
}

function main() {
  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const summaries = loadSummaries();
  const links = artifactLinks(summaries);
  const stepSummary = buildStepSummary(summaries, links);
  const html = buildHtmlDashboard(summaries, links);

  const htmlOut = path.join(reportDir, 'unified_dashboard.html');
  fs.writeFileSync(htmlOut, html, 'utf8');
  console.log('Wrote', htmlOut);

  const summaryOut = path.join(reportDir, 'github_step_summary.md');
  fs.writeFileSync(summaryOut, stepSummary, 'utf8');
  console.log('Wrote', summaryOut);

  const ghSummary = process.env.GITHUB_STEP_SUMMARY;
  if (ghSummary) {
    fs.appendFileSync(ghSummary, stepSummary, 'utf8');
    console.log('Appended GitHub Step Summary');
  }
}

main();
