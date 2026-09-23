/* ═══════════════════════════════════════════════════════
   NEXUS AGENT — App Doctor
   Analyzes workspace projects and fixes common issues
═══════════════════════════════════════════════════════ */

window.Doctor = (() => {

  const CHECKS = [
    // ── Node / JS ────────────────────────────────────
    { id:'node_pkg',   label:'package.json valid',      lang:['js','ts','node'], fn: checkPackageJson },
    { id:'node_lock',  label:'Lock file present',        lang:['js','ts','node'], fn: checkLockFile },
    { id:'node_mods',  label:'node_modules installed',   lang:['js','ts','node'], fn: checkNodeModules },
    { id:'node_main',  label:'Entry point exists',       lang:['js','ts','node'], fn: checkNodeMain },
    { id:'node_scripts',label:'Build scripts defined',  lang:['js','ts','node'], fn: checkBuildScripts },
    // ── Python ───────────────────────────────────────
    { id:'py_req',     label:'requirements.txt present', lang:['py'],             fn: checkPyReqs },
    { id:'py_venv',    label:'Virtual environment',      lang:['py'],             fn: checkPyVenv },
    { id:'py_syntax',  label:'Python syntax (sample)',   lang:['py'],             fn: checkPySyntax },
    // ── General ──────────────────────────────────────
    { id:'git_init',   label:'Git repository',           lang:['*'],              fn: checkGit },
    { id:'gitignore',  label:'.gitignore present',       lang:['*'],              fn: checkGitignore },
    { id:'readme',     label:'README present',           lang:['*'],              fn: checkReadme },
    { id:'env_sample', label:'.env.example present',     lang:['*'],              fn: checkEnvSample },
    { id:'large_files',label:'No huge files (>50MB)',    lang:['*'],              fn: checkLargeFiles },
    { id:'secrets',    label:'No secrets committed',     lang:['*'],              fn: checkSecrets },
    // ── React / Frontend ─────────────────────────────
    { id:'react_tsconfig',label:'tsconfig.json valid',   lang:['react','ts'],     fn: checkTsconfig },
    { id:'react_lint', label:'ESLint configured',        lang:['react','ts','js'],fn: checkEslint },
    // ── Docker ───────────────────────────────────────
    { id:'dockerfile', label:'Dockerfile valid',         lang:['docker'],         fn: checkDockerfile },
  ];

  const FIXES = {
    node_mods:   fixNodeModules,
    gitignore:   fixGitignore,
    readme:      fixReadme,
    env_sample:  fixEnvSample,
    git_init:    fixGitInit,
    node_scripts:fixNodeScripts,
    py_req:      fixPyReqs,
    react_lint:  fixEslint,
  };

  let ws = '';
  let results = [];

  async function run(workspace) {
    ws = workspace;
    results = [];
    const lang = await detectLang(ws);
    renderUI('running', lang);

    for (const check of CHECKS) {
      if (check.lang.includes('*') || check.lang.some(l => lang.includes(l))) {
        const r = await runCheck(check);
        results.push(r);
        updateRow(r);
      }
    }
    renderSummary();
  }

  async function detectLang(dir) {
    const files = await nexus.listFiles(dir);
    const flat  = flatNames(files);
    const langs = new Set(['*']);
    if (flat.some(f => f.endsWith('.js') || f.endsWith('.ts') || f === 'package.json')) langs.add('js'), langs.add('ts'), langs.add('node');
    if (flat.some(f => f.endsWith('.py') || f === 'requirements.txt')) langs.add('py');
    if (flat.some(f => f.endsWith('.tsx') || f.endsWith('.jsx'))) langs.add('react');
    if (flat.some(f => f === 'Dockerfile' || f === 'docker-compose.yml')) langs.add('docker');
    return [...langs];
  }

  function flatNames(items, acc = []) {
    for (const i of (items||[])) {
      acc.push(i.name);
      if (i.children) flatNames(i.children, acc);
    }
    return acc;
  }

  async function runCheck(check) {
    try {
      const result = await check.fn(ws);
      return { ...check, ...result };
    } catch(e) {
      return { ...check, status:'error', message: e.message, fixable: false };
    }
  }

  // ── Individual checks ────────────────────────────────
  async function checkPackageJson(dir) {
    const content = await nexus.readFile(`${dir}/package.json`);
    if (!content) return { status:'fail', message:'package.json missing', fixable:false };
    try {
      const pkg = JSON.parse(content);
      const issues = [];
      if (!pkg.name) issues.push('missing name');
      if (!pkg.version) issues.push('missing version');
      return issues.length
        ? { status:'warn', message:`Issues: ${issues.join(', ')}`, fixable:false }
        : { status:'pass', message:'Valid package.json' };
    } catch(e) {
      return { status:'fail', message:`Invalid JSON: ${e.message}`, fixable:false };
    }
  }

  async function checkLockFile(dir) {
    const hasYarn = await nexus.fileExists(`${dir}/yarn.lock`);
    const hasNpm  = await nexus.fileExists(`${dir}/package-lock.json`);
    const hasPnpm = await nexus.fileExists(`${dir}/pnpm-lock.yaml`);
    if (hasYarn || hasNpm || hasPnpm) return { status:'pass', message:'Lock file found' };
    return { status:'warn', message:'No lock file — run npm install', fixable:false };
  }

  async function checkNodeModules(dir) {
    const exists = await nexus.fileExists(`${dir}/node_modules`);
    if (exists) return { status:'pass', message:'node_modules present' };
    const hasPkg = await nexus.fileExists(`${dir}/package.json`);
    if (!hasPkg) return { status:'skip', message:'No package.json' };
    return { status:'fail', message:'node_modules missing — dependencies not installed', fixable:true, fixId:'node_mods' };
  }

  async function checkNodeMain(dir) {
    const content = await nexus.readFile(`${dir}/package.json`);
    if (!content) return { status:'skip', message:'No package.json' };
    try {
      const pkg = JSON.parse(content);
      const main = pkg.main || 'index.js';
      const exists = await nexus.fileExists(`${dir}/${main}`);
      return exists
        ? { status:'pass', message:`Entry point found: ${main}` }
        : { status:'warn', message:`Entry point missing: ${main}`, fixable:false };
    } catch { return { status:'skip', message:'Could not parse package.json' }; }
  }

  async function checkBuildScripts(dir) {
    const content = await nexus.readFile(`${dir}/package.json`);
    if (!content) return { status:'skip', message:'No package.json' };
    try {
      const pkg = JSON.parse(content);
      const scripts = Object.keys(pkg.scripts || {});
      if (scripts.length === 0) return { status:'warn', message:'No scripts defined', fixable:true, fixId:'node_scripts' };
      return { status:'pass', message:`Scripts: ${scripts.slice(0,5).join(', ')}` };
    } catch { return { status:'skip', message:'Could not parse package.json' }; }
  }

  async function checkPyReqs(dir) {
    const exists = await nexus.fileExists(`${dir}/requirements.txt`);
    if (exists) return { status:'pass', message:'requirements.txt found' };
    const hasPyproject = await nexus.fileExists(`${dir}/pyproject.toml`);
    if (hasPyproject) return { status:'pass', message:'pyproject.toml found' };
    return { status:'warn', message:'No requirements.txt', fixable:true, fixId:'py_req' };
  }

  async function checkPyVenv(dir) {
    const hasVenv  = await nexus.fileExists(`${dir}/venv`);
    const hasVenv2 = await nexus.fileExists(`${dir}/.venv`);
    if (hasVenv || hasVenv2) return { status:'pass', message:'Virtual environment found' };
    return { status:'info', message:'No venv detected (may be global)', fixable:false };
  }

  async function checkPySyntax(dir) {
    const files = await nexus.listFiles(dir);
    const pyFiles = flatNames(files).filter(f => f.endsWith('.py')).slice(0, 3);
    if (!pyFiles.length) return { status:'skip', message:'No .py files found' };
    for (const f of pyFiles) {
      const r = await nexus.execCmd(`python -m py_compile "${dir}/${f}" 2>&1 && echo OK`, dir);
      if (r.stdout.includes('OK')) continue;
      if (r.stderr) return { status:'fail', message:`Syntax error in ${f}: ${r.stderr.slice(0,80)}`, fixable:false };
    }
    return { status:'pass', message:`Python syntax OK (checked ${pyFiles.length} files)` };
  }

  async function checkGit(dir) {
    const exists = await nexus.fileExists(`${dir}/.git`);
    if (exists) {
      const r = await nexus.execCmd('git log --oneline -1 2>&1', dir);
      const commits = r.stdout.trim();
      return { status:'pass', message:`Git repo, last: ${commits || '(no commits yet)'}` };
    }
    return { status:'warn', message:'Not a git repository', fixable:true, fixId:'git_init' };
  }

  async function checkGitignore(dir) {
    const exists = await nexus.fileExists(`${dir}/.gitignore`);
    if (exists) {
      const content = await nexus.readFile(`${dir}/.gitignore`);
      const hasNode = content.includes('node_modules');
      const hasEnv  = content.includes('.env');
      const issues = [];
      if (!hasNode) issues.push('node_modules not ignored');
      if (!hasEnv)  issues.push('.env not ignored');
      return issues.length
        ? { status:'warn', message:`Issues: ${issues.join(', ')}`, fixable:true, fixId:'gitignore' }
        : { status:'pass', message:'.gitignore configured' };
    }
    return { status:'fail', message:'.gitignore missing', fixable:true, fixId:'gitignore' };
  }

  async function checkReadme(dir) {
    const has = await nexus.fileExists(`${dir}/README.md`);
    if (has) return { status:'pass', message:'README.md found' };
    const hasTxt = await nexus.fileExists(`${dir}/README.txt`);
    if (hasTxt) return { status:'pass', message:'README.txt found' };
    return { status:'warn', message:'No README', fixable:true, fixId:'readme' };
  }

  async function checkEnvSample(dir) {
    const hasEnv = await nexus.fileExists(`${dir}/.env`);
    if (!hasEnv) return { status:'skip', message:'No .env file (not applicable)' };
    const hasSample = await nexus.fileExists(`${dir}/.env.example`);
    if (hasSample) return { status:'pass', message:'.env.example present' };
    return { status:'warn', message:'.env exists but no .env.example', fixable:true, fixId:'env_sample' };
  }

  async function checkLargeFiles(dir) {
    const files = await nexus.listFiles(dir);
    const large = [];
    function scan(items) {
      for (const i of (items||[])) {
        if (i.type === 'file' && i.size > 50*1024*1024) large.push(`${i.name} (${(i.size/1024/1024).toFixed(0)}MB)`);
        if (i.children) scan(i.children);
      }
    }
    scan(files);
    if (large.length) return { status:'warn', message:`Large files: ${large.join(', ')}`, fixable:false };
    return { status:'pass', message:'No files over 50MB' };
  }

  async function checkSecrets(dir) {
    const files = await nexus.listFiles(dir);
    const suspects = [];
    function scan(items) {
      for (const i of (items||[])) {
        if (i.type==='file' && ['.env','.pem','.key','secrets.json','credentials.json'].some(s=>i.name.includes(s))) {
          suspects.push(i.name);
        }
        if (i.children) scan(i.children);
      }
    }
    scan(files);
    if (suspects.length) return { status:'warn', message:`Potential secret files: ${suspects.join(', ')} — ensure these are gitignored`, fixable:false };
    return { status:'pass', message:'No obvious secret files found' };
  }

  async function checkTsconfig(dir) {
    const exists = await nexus.fileExists(`${dir}/tsconfig.json`);
    if (!exists) return { status:'warn', message:'tsconfig.json missing', fixable:false };
    const content = await nexus.readFile(`${dir}/tsconfig.json`);
    try { JSON.parse(content); return { status:'pass', message:'tsconfig.json valid' }; }
    catch(e) { return { status:'fail', message:`Invalid tsconfig: ${e.message}`, fixable:false }; }
  }

  async function checkEslint(dir) {
    const files = ['.eslintrc.js','.eslintrc.json','.eslintrc.cjs','eslint.config.js'];
    for (const f of files) {
      if (await nexus.fileExists(`${dir}/${f}`)) return { status:'pass', message:`ESLint: ${f}` };
    }
    return { status:'info', message:'No ESLint config', fixable:true, fixId:'react_lint' };
  }

  async function checkDockerfile(dir) {
    const exists = await nexus.fileExists(`${dir}/Dockerfile`);
    if (!exists) return { status:'skip', message:'No Dockerfile' };
    const content = await nexus.readFile(`${dir}/Dockerfile`);
    const hasFrom = /^FROM /m.test(content);
    return hasFrom
      ? { status:'pass', message:'Dockerfile looks valid' }
      : { status:'warn', message:'Dockerfile has no FROM instruction', fixable:false };
  }

  // ── Fixers ──────────────────────────────────────────
  async function fixNodeModules(dir) {
    const r = await nexus.execCmd('npm install', dir);
    return r.code === 0 ? 'npm install completed' : `Error: ${r.stderr.slice(0,100)}`;
  }

  async function fixGitignore(dir) {
    const content = `# Dependencies\nnode_modules/\n.pnp\n.pnp.js\n\n# Testing\ncoverage/\n\n# Production\nbuild/\ndist/\n.next/\nout/\n\n# Misc\n.DS_Store\n*.pem\n\n# Debug\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n\n# Local env files\n.env\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n\n# Python\n__pycache__/\n*.py[cod]\n*.so\n.venv/\nvenv/\nenv/\n*.egg-info/\ndist/\nbuild/\n\n# IDE\n.vscode/\n.idea/\n*.swp\n*.swo\n`;
    await nexus.writeFile(`${dir}/.gitignore`, content);
    return '.gitignore created with comprehensive defaults';
  }

  async function fixReadme(dir) {
    const pkgRaw = await nexus.readFile(`${dir}/package.json`);
    let name = 'Project', desc = 'A software project.';
    try { const p = JSON.parse(pkgRaw||'{}'); name=p.name||name; desc=p.description||desc; } catch {}
    const content = `# ${name}\n\n${desc}\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm start\n\`\`\`\n\n## Development\n\n\`\`\`bash\nnpm run dev\n\`\`\`\n\n## Build\n\n\`\`\`bash\nnpm run build\n\`\`\`\n\n## License\n\nMIT\n`;
    await nexus.writeFile(`${dir}/README.md`, content);
    return 'README.md created';
  }

  async function fixEnvSample(dir) {
    const envContent = await nexus.readFile(`${dir}/.env`) || '';
    const lines = envContent.split('\n').map(l => {
      const [key] = l.split('=');
      return key && key.trim() ? `${key.trim()}=` : l;
    }).join('\n');
    await nexus.writeFile(`${dir}/.env.example`, lines);
    return '.env.example created (values stripped)';
  }

  async function fixGitInit(dir) {
    const r = await nexus.execCmd('git init && git add -A && git commit -m "Initial commit (Nexus Agent)"', dir);
    return r.code === 0 ? 'Git repo initialized with initial commit' : `Error: ${r.stderr.slice(0,100)}`;
  }

  async function fixNodeScripts(dir) {
    const pkgRaw = await nexus.readFile(`${dir}/package.json`);
    if (!pkgRaw) return 'No package.json found';
    const pkg = JSON.parse(pkgRaw);
    pkg.scripts = pkg.scripts || {};
    if (!pkg.scripts.start)  pkg.scripts.start  = 'node index.js';
    if (!pkg.scripts.dev)    pkg.scripts.dev    = 'node --watch index.js';
    if (!pkg.scripts.test)   pkg.scripts.test   = 'echo "No tests configured"';
    await nexus.writeFile(`${dir}/package.json`, JSON.stringify(pkg, null, 2));
    return 'Added start, dev, test scripts to package.json';
  }

  async function fixPyReqs(dir) {
    const r = await nexus.execCmd('pip freeze > requirements.txt 2>&1', dir);
    if (r.code === 0) return 'requirements.txt created from pip freeze';
    await nexus.writeFile(`${dir}/requirements.txt`, '# Add your dependencies here\n# Example:\n# requests==2.31.0\n# python-dotenv==1.0.0\n');
    return 'requirements.txt scaffold created';
  }

  async function fixEslint(dir) {
    const config = `module.exports = {
  env: { browser: true, es2021: true, node: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: { 'no-unused-vars': 'warn', 'no-console': 'off' },
};\n`;
    await nexus.writeFile(`${dir}/.eslintrc.cjs`, config);
    return '.eslintrc.cjs created with recommended rules';
  }

  // ── AI-powered deep analysis ─────────────────────────
  async function aiAnalyze(workspace, callAI) {
    const files = await nexus.listFiles(workspace);
    const flat  = flatNames(files);
    const prompt = `Analyze this software project file structure and provide a detailed health report with specific actionable fixes.\n\nProject files:\n${flat.slice(0,100).join('\n')}\n\nRespond with:\n1. Project type detected\n2. Top 5 issues found (with specific fixes)\n3. Architecture recommendations\n4. Security concerns\n5. Performance improvements\n6. Missing best-practice files`;
    return await callAI('You are an expert software architect and code reviewer.', [{ role:'user', content:prompt }], { maxTokens: 2000 });
  }

  // ── UI rendering ─────────────────────────────────────
  function renderUI(state, lang) {
    const el = document.getElementById('doctor-results');
    if (!el) return;
    if (state === 'running') {
      el.innerHTML = `
        <div style="margin-bottom:12px;font-size:12px;color:var(--text2)">Detected: ${(lang||[]).filter(l=>l!=='*').join(', ') || 'Unknown'}</div>
        <div id="doctor-rows"></div>
        <div id="doctor-summary"></div>`;
    }
  }

  function updateRow(r) {
    const box = document.getElementById('doctor-rows');
    if (!box) return;
    const colors = { pass:'var(--green)', fail:'var(--red)', warn:'var(--yellow)', info:'var(--accent3)', error:'var(--red)', skip:'var(--text3)' };
    const icons  = { pass:'✓', fail:'✗', warn:'⚠', info:'ℹ', error:'!', skip:'—' };
    const existing = document.getElementById(`dr-${r.id}`);
    const html = `
      <div class="dr-row" id="dr-${r.id}">
        <span class="dr-icon" style="color:${colors[r.status]||'#888'}">${icons[r.status]||'?'}</span>
        <span class="dr-label">${r.label}</span>
        <span class="dr-msg">${r.message||''}</span>
        ${r.fixable ? `<button class="btn btn-grn btn-sm" onclick="Doctor.fix('${r.fixId}')">Auto-fix</button>` : ''}
      </div>`;
    if (existing) existing.outerHTML = html;
    else box.insertAdjacentHTML('beforeend', html);
  }

  function renderSummary() {
    const box = document.getElementById('doctor-summary');
    if (!box) return;
    const pass  = results.filter(r=>r.status==='pass').length;
    const fail  = results.filter(r=>r.status==='fail').length;
    const warn  = results.filter(r=>r.status==='warn').length;
    const fixable = results.filter(r=>r.fixable).length;
    box.innerHTML = `
      <div class="dr-summary">
        <span style="color:var(--green)">✓ ${pass} passed</span>
        <span style="color:var(--red)">✗ ${fail} failed</span>
        <span style="color:var(--yellow)">⚠ ${warn} warnings</span>
        ${fixable ? `<button class="btn btn-pri btn-sm" onclick="Doctor.fixAll()" style="margin-left:auto">⚡ Fix All (${fixable})</button>` : ''}
      </div>`;
  }

  async function fix(fixId) {
    const fixer = FIXES[fixId];
    if (!fixer) { window.toast?.(`No fixer for: ${fixId}`, 'er'); return; }
    window.toast?.(`Fixing ${fixId}…`, 'in');
    const msg = await fixer(ws);
    window.toast?.(msg, 'ok');
    // Re-run affected check
    const check = CHECKS.find(c => c.id === fixId || c.fixId === fixId);
    if (check) { const r = await runCheck(check); updateRow(r); }
  }

  async function fixAll() {
    const fixable = results.filter(r => r.fixable && FIXES[r.fixId]);
    for (const r of fixable) await fix(r.fixId);
    renderSummary();
  }

  return { run, fix, fixAll, aiAnalyze, renderUI };
})();
