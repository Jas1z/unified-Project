const fs = require('fs');
const path = require('path');

function writeCiSummary(reportDir, summary) {
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  const out = path.join(reportDir, 'ci-summary.json');
  fs.writeFileSync(out, JSON.stringify(summary, null, 2), 'utf8');
  return out;
}

module.exports = { writeCiSummary };
