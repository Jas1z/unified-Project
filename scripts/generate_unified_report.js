const fs = require('fs');
const path = require('path');

function humanSize(bytes){
  if(!bytes) return '0 B';
  const units = ['B','KB','MB','GB','TB'];
  let i=0; while(bytes>=1024 && i<units.length-1){ bytes/=1024; i++; }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function walk(dir){
  let files=[];
  if(!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir);
  for(const it of items){
    const p = path.join(dir,it);
    const stat = fs.statSync(p);
    if(stat.isDirectory()) files = files.concat(walk(p));
    else files.push(p);
  }
  return files;
}

function summarizeArtifact(dir){
  const files = walk(dir);
  const count = files.length;
  const size = files.reduce((s,f)=> s + fs.statSync(f).size, 0);
  return {count, size, sample: files.slice(0,5).map(f=>path.relative(process.cwd(), f))};
}

function main(){
  const artifactsRoot = path.join(process.cwd(),'artifacts');
  const reportDir = path.join(process.cwd(),'reports');
  if(!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, {recursive:true});

  const artifactNames = fs.existsSync(artifactsRoot) ? fs.readdirSync(artifactsRoot) : [];
  const rows = [];
  for(const name of artifactNames){
    const dir = path.join(artifactsRoot, name);
    const info = summarizeArtifact(dir);
    rows.push({name, ...info});
  }

  // Also check some common report folders in repo for convenience
  const extra = [
    {key:'frontend', dir:path.join(process.cwd(),'frontend','reports')},
    {key:'selenium-tests', dir:path.join(process.cwd(),'selenium-tests','reports')},
    {key:'load-tests', dir:path.join(process.cwd(),'load-tests','reports')},
    {key:'backend', dir:path.join(process.cwd(),'Unified-Secure-Patient-Record-System','reports')},
  ];
  for(const e of extra){
    if(fs.existsSync(e.dir)){
      const info = summarizeArtifact(e.dir);
      rows.push({name:e.key, ...info});
    }
  }

  const html = [];
  html.push('<!doctype html>');
  html.push('<html><head><meta charset="utf-8"><title>Unified Test Dashboard</title>');
  html.push('<style>body{font-family:Arial,Helvetica,sans-serif;background:#0b0f13;color:#e6eef6;padding:20px}table{border-collapse:collapse;width:100%}th,td{padding:10px;border:1px solid #222}th{background:#111827;text-align:left}tr:nth-child(even){background:#081018}a{color:#9bd1ff}</style>');
  html.push('</head><body>');
  html.push('<h1>Unified Test Verification Dashboard</h1>');
  html.push(`<p>Generated: ${new Date().toISOString()}</p>`);
  html.push('<table>');
  html.push('<thead><tr><th>Artifact</th><th>Files</th><th>Total Size</th><th>Samples</th></tr></thead>');
  html.push('<tbody>');
  for(const r of rows){
    html.push('<tr>');
    html.push(`<td>${r.name}</td>`);
    html.push(`<td>${r.count}</td>`);
    html.push(`<td>${humanSize(r.size)}</td>`);
    html.push(`<td>${(r.sample||[]).map(s=>s.replace(/</g,'&lt;')).join('<br>')}</td>`);
    html.push('</tr>');
  }
  html.push('</tbody></table>');
  html.push('<p>Artifacts used: ' + artifactNames.join(', ') + '</p>');
  html.push('</body></html>');

  const out = path.join(reportDir,'unified_dashboard.html');
  fs.writeFileSync(out, html.join('\n'), 'utf8');
  console.log('Wrote', out);
}

main();
