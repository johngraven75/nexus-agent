/* ═══════════════════════════════════════════════════════════════════════════
   NEXUS AGENT — Dependency Installer
   Full Windows local AI + dev environment setup
   Checks, installs and verifies every tool the agent needs
═══════════════════════════════════════════════════════════════════════════ */

window.Installer = (() => {

  // ── Tool definitions ────────────────────────────────────────────────────────
  const TOOLS = [
    // ── Core runtime tools ─────────────────────────────────────
    {
      id: 'winget',
      name: 'winget (Windows Package Manager)',
      category: 'Core',
      required: true,
      check: 'winget --version',
      checkRegex: /v\d+\.\d+/,
      install: null,   // Built into Windows 10 1709+ — cannot be installed here
      fallback: 'Download from https://aka.ms/getwinget or update Windows',
      note: 'Built into Windows 10/11. If missing, update via Microsoft Store (App Installer).',
    },
    {
      id: 'git',
      name: 'Git for Windows',
      category: 'Core',
      required: true,
      check: 'git --version',
      checkRegex: /git version \d+/,
      winget: 'Git.Git',
      postInstall: 'git config --global core.autocrlf true',
      note: 'Required for version control, cloning repos, and many agent tasks.',
      directUrl: 'https://git-scm.com/download/win',
    },
    {
      id: 'node',
      name: 'Node.js LTS (includes npm)',
      category: 'Core',
      required: true,
      check: 'node --version',
      checkRegex: /v\d+\.\d+/,
      winget: 'OpenJS.NodeJS.LTS',
      note: 'Required to build and run JavaScript/TypeScript projects.',
      directUrl: 'https://nodejs.org/en/download',
    },
    {
      id: 'python',
      name: 'Python 3.12',
      category: 'Core',
      required: true,
      check: 'python --version',
      checkRegex: /Python 3\.\d+/,
      winget: 'Python.Python.3.12',
      postInstall: 'python -m pip install --upgrade pip',
      note: 'Required for Python projects and many AI/ML tools.',
      directUrl: 'https://www.python.org/downloads/windows/',
    },
    {
      id: 'npm_globals',
      name: 'Global npm tools (pnpm, yarn, ts-node)',
      category: 'Core',
      required: false,
      check: 'pnpm --version',
      checkRegex: /\d+\.\d+/,
      install: 'npm install -g pnpm yarn ts-node typescript',
      note: 'Useful package managers and TypeScript runtime.',
    },
    {
      id: 'pip_tools',
      name: 'Python tools (pipenv, poetry, virtualenv)',
      category: 'Core',
      required: false,
      check: 'pipenv --version',
      checkRegex: /pipenv/,
      install: 'pip install pipenv poetry virtualenv --break-system-packages',
      note: 'Python project and environment management tools.',
    },
    // ── Ollama + local AI ──────────────────────────────────────
    {
      id: 'ollama',
      name: 'Ollama (local LLM runner)',
      category: 'Local AI',
      required: false,
      check: 'ollama --version',
      checkRegex: /ollama version \d+/i,
      winget: 'Ollama.Ollama',
      postInstall: null,   // service start handled separately
      note: 'Runs LLMs locally on your machine (llama3, mistral, codellama, etc).',
      directUrl: 'https://ollama.com/download/windows',
      // After install, PATH needs refresh — handled by restart
    },
    {
      id: 'ollama_service',
      name: 'Ollama Service (start server)',
      category: 'Local AI',
      required: false,
      check: null,  // checked by HTTP ping instead
      httpCheck: 'http://localhost:11434',
      install: 'START /B "" ollama serve',
      note: 'Starts the Ollama API server so the agent can use local models.',
      // Windows: ollama starts as background service on install
    },
    {
      id: 'cuda',
      name: 'NVIDIA CUDA Toolkit (GPU acceleration)',
      category: 'Local AI',
      required: false,
      check: 'nvcc --version',
      checkRegex: /release \d+\.\d+/,
      winget: 'Nvidia.CUDA',
      note: 'Enables GPU acceleration for Ollama and PyTorch. 5-10x faster inference.',
      directUrl: 'https://developer.nvidia.com/cuda-downloads',
      gpuOnly: true,
    },
    {
      id: 'lmstudio',
      name: 'LM Studio (GUI for local models)',
      category: 'Local AI',
      required: false,
      check: null,
      note: 'GUI app for running local models with an OpenAI-compatible API server.',
      directUrl: 'https://lmstudio.ai/',
      manualOnly: true,   // No winget package
    },
    // ── Build tools ────────────────────────────────────────────
    {
      id: 'make',
      name: 'Make / Build Tools',
      category: 'Build',
      required: false,
      check: 'make --version',
      checkRegex: /GNU Make/,
      winget: 'GnuWin32.Make',
      note: 'Required for compiling native modules and C/C++ projects.',
    },
    {
      id: 'cmake',
      name: 'CMake',
      category: 'Build',
      required: false,
      check: 'cmake --version',
      checkRegex: /cmake version/,
      winget: 'Kitware.CMake',
      note: 'Required for cross-platform C/C++ builds.',
    },
    {
      id: 'rust',
      name: 'Rust + Cargo',
      category: 'Build',
      required: false,
      check: 'rustc --version',
      checkRegex: /rustc \d+/,
      install: 'winget install Rustlang.Rustup -e --silent && rustup default stable',
      note: 'Required for Rust projects and some Python packages with native extensions.',
      directUrl: 'https://rustup.rs/',
    },
    {
      id: 'dotnet',
      name: '.NET Runtime 8',
      category: 'Build',
      required: false,
      check: 'dotnet --version',
      checkRegex: /^8\.\d+/,
      winget: 'Microsoft.DotNet.Runtime.8',
      note: 'Required for .NET/C# projects and some CLI tools.',
    },
    // ── Dev tools ──────────────────────────────────────────────
    {
      id: 'docker',
      name: 'Docker Desktop',
      category: 'DevOps',
      required: false,
      check: 'docker --version',
      checkRegex: /Docker version/,
      winget: 'Docker.DockerDesktop',
      note: 'Container runtime. Required for dockerized deployments.',
      directUrl: 'https://www.docker.com/products/docker-desktop/',
    },
    {
      id: 'kubectl',
      name: 'kubectl (Kubernetes CLI)',
      category: 'DevOps',
      required: false,
      check: 'kubectl version --client',
      checkRegex: /Client Version/,
      winget: 'Kubernetes.kubectl',
      note: 'CLI for managing Kubernetes clusters.',
    },
    {
      id: 'gh',
      name: 'GitHub CLI',
      category: 'DevOps',
      required: false,
      check: 'gh --version',
      checkRegex: /gh version/,
      winget: 'GitHub.cli',
      note: 'Manage GitHub repos, PRs and issues from the terminal.',
    },
    {
      id: 'az',
      name: 'Azure CLI',
      category: 'DevOps',
      required: false,
      check: 'az --version',
      checkRegex: /azure-cli/,
      winget: 'Microsoft.AzureCLI',
      note: 'Manage Azure resources from the terminal.',
    },
    {
      id: 'awscli',
      name: 'AWS CLI v2',
      category: 'DevOps',
      required: false,
      check: 'aws --version',
      checkRegex: /aws-cli\/2/,
      winget: 'Amazon.AWSCLI',
      note: 'Manage AWS services from the terminal.',
    },
    // ── Python AI/ML ───────────────────────────────────────────
    {
      id: 'torch',
      name: 'PyTorch (CPU)',
      category: 'AI/ML',
      required: false,
      check: 'python -c "import torch; print(torch.__version__)"',
      checkRegex: /^\d+\.\d+/,
      install: 'pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu',
      note: 'ML framework. Install GPU version from pytorch.org for training.',
    },
    {
      id: 'transformers',
      name: 'HuggingFace Transformers + Diffusers',
      category: 'AI/ML',
      required: false,
      check: 'python -c "import transformers; print(transformers.__version__)"',
      checkRegex: /^\d+\.\d+/,
      install: 'pip install transformers diffusers accelerate datasets huggingface_hub sentencepiece protobuf',
      note: 'Required for running HF models locally.',
    },
    {
      id: 'llama_cpp',
      name: 'llama-cpp-python (GGUF runner)',
      category: 'AI/ML',
      required: false,
      check: 'python -c "import llama_cpp; print(\'ok\')"',
      checkRegex: /ok/,
      install: 'pip install llama-cpp-python',
      note: 'Runs GGUF models directly in Python without Ollama.',
    },
    {
      id: 'langchain',
      name: 'LangChain + LlamaIndex',
      category: 'AI/ML',
      required: false,
      check: 'python -c "import langchain; print(langchain.__version__)"',
      checkRegex: /\d+\.\d+/,
      install: 'pip install langchain langchain-community langchain-openai llama-index openai anthropic',
      note: 'AI orchestration frameworks used in many AI projects.',
    },
  ];

  // ── State ───────────────────────────────────────────────────────────────────
  let checkResults = {};
  let installing   = false;
  let logEl        = null;

  // ── Main entry ─────────────────────────────────────────────────────────────
  async function openWizard() {
    buildWizardUI();
    await runAllChecks();
  }

  // ── Build the wizard UI ─────────────────────────────────────────────────────
  function buildWizardUI() {
    const modal = document.getElementById('conn-modal');
    const body  = document.getElementById('conn-modal-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div>
          <div style="font-size:16px;font-weight:700;color:var(--text0)">🔧 Dependency Installer</div>
          <div style="font-size:12px;color:var(--text2);margin-top:3px">Check and install all tools the agent needs</div>
        </div>
        <button style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:18px;padding:4px" onclick="document.getElementById('conn-modal').classList.remove('open')">✕</button>
      </div>

      <div id="inst-tabs" style="display:flex;gap:4px;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:0">
        ${['Core','Local AI','Build','DevOps','AI/ML'].map((c,i)=>`
          <div class="stab ${i===0?'on':''}" data-itab="${c}" onclick="Installer.switchTab('${c}')" style="cursor:pointer">${c}</div>`).join('')}
      </div>

      <div id="inst-tool-list" style="display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto;padding-right:4px">
        <div style="color:var(--text2);font-size:12px;text-align:center;padding:20px">Checking installed tools…</div>
      </div>

      <div style="margin-top:10px;display:flex;gap:7px;flex-wrap:wrap;border-top:1px solid var(--border);padding-top:10px">
        <button class="btn btn-pri" onclick="Installer.installRequired()">⚡ Install Required</button>
        <button class="btn btn-sec" onclick="Installer.installAll()">📦 Install All Selected</button>
        <button class="btn btn-sec" onclick="Installer.runAllChecks()">↻ Re-check</button>
        <button class="btn btn-grn btn-sm" onclick="Installer.installOllamaFull()">🦙 Full Ollama Setup</button>
      </div>

      <div id="inst-log-wrap" style="display:none;margin-top:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
          <span style="font-size:11px;font-weight:700;color:var(--text1)">Install Log</span>
          <button class="btn btn-sec btn-sm" onclick="document.getElementById('inst-log-wrap').style.display='none'">Hide</button>
        </div>
        <div id="inst-log" style="background:var(--bg0);border:1px solid var(--border);border-radius:5px;padding:10px;font-family:var(--mono);font-size:11px;color:var(--text1);height:150px;overflow-y:auto;white-space:pre-wrap;word-break:break-all"></div>
      </div>`;

    modal.classList.add('open');
    logEl = document.getElementById('inst-log');
    currentInstTab = 'Core';
  }

  let currentInstTab = 'Core';

  function switchTab(cat) {
    currentInstTab = cat;
    document.querySelectorAll('[data-itab]').forEach(t => {
      t.classList.toggle('on', t.dataset.itab === cat);
    });
    renderToolList();
  }

  // ── Check all tools ─────────────────────────────────────────────────────────
  async function runAllChecks() {
    const listEl = document.getElementById('inst-tool-list');
    if (listEl) listEl.innerHTML = '<div style="color:var(--text2);font-size:12px;text-align:center;padding:16px">🔍 Checking installed tools…</div>';

    // Run checks in parallel batches of 4
    const batch = 4;
    for (let i = 0; i < TOOLS.length; i += batch) {
      const group = TOOLS.slice(i, i + batch);
      await Promise.all(group.map(async t => {
        checkResults[t.id] = await checkTool(t);
      }));
    }
    renderToolList();
  }

  async function checkTool(tool) {
    if (tool.manualOnly) return { status: 'manual', msg: 'Manual download required' };
    if (!tool.check && tool.httpCheck) {
      // HTTP check (for ollama service)
      try {
        const r = await nexus.httpRequest({ method:'GET', url:tool.httpCheck, headers:{}, timeout:2 });
        return r.status < 500 ? { status:'ok', msg:'Service running' } : { status:'missing', msg:'Service not running' };
      } catch { return { status:'missing', msg:'Service not running' }; }
    }
    if (!tool.check) return { status:'unknown', msg:'Cannot check' };
    try {
      const r = await nexus.execCmd(tool.check, null);
      const out = (r.stdout + r.stderr).trim();
      if (r.code === 0 && tool.checkRegex && tool.checkRegex.test(out)) {
        const version = out.split('\n')[0].slice(0, 40);
        return { status:'ok', msg: version };
      }
      if (r.code === 0 && !tool.checkRegex) return { status:'ok', msg:'Installed' };
      return { status:'missing', msg:'Not found in PATH' };
    } catch(e) {
      return { status:'missing', msg:'Not found' };
    }
  }

  // ── Render tool list for current tab ────────────────────────────────────────
  function renderToolList() {
    const listEl = document.getElementById('inst-tool-list');
    if (!listEl) return;

    const tools = TOOLS.filter(t => t.category === currentInstTab);
    if (!tools.length) { listEl.innerHTML='<div style="color:var(--text2);font-size:12px;padding:12px">No tools in this category.</div>'; return; }

    listEl.innerHTML = tools.map(t => {
      const res    = checkResults[t.id];
      const status = res?.status || 'checking';
      const icon   = { ok:'✅', missing:'❌', manual:'📥', unknown:'❓', checking:'⏳' }[status] || '❓';
      const color  = { ok:'var(--green)', missing:'var(--red)', manual:'var(--yellow)', unknown:'var(--text3)', checking:'var(--text2)' }[status];
      const canInstall = status !== 'ok' && !t.manualOnly;
      const canFix     = status === 'missing' && t.gpuOnly;

      return `
        <div class="inst-tool-row" style="display:flex;align-items:flex-start;gap:9px;padding:9px 10px;background:var(--bg2);border:1px solid var(--border);border-radius:6px">
          <div style="font-size:16px;flex-shrink:0;margin-top:1px">${icon}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
              <span style="font-size:12px;font-weight:600;color:var(--text0)">${esc(t.name)}</span>
              ${t.required ? '<span style="font-size:9px;background:#2d1f5e;color:var(--accent2);border:1px solid #4f3aaa;border-radius:99px;padding:1px 6px">REQUIRED</span>' : ''}
            </div>
            <div style="font-size:11px;color:${color};margin-top:2px">${esc(res?.msg || 'Checking…')}</div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px;line-height:1.4">${esc(t.note||'')}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
            ${canInstall && !t.manualOnly ? `<button class="btn btn-pri btn-sm" onclick="Installer.installTool('${t.id}')">Install</button>` : ''}
            ${t.directUrl ? `<a class="btn btn-sec btn-sm" href="${t.directUrl}" target="_blank" style="text-decoration:none;white-space:nowrap">↗ Download</a>` : ''}
            ${status==='ok' ? `<button class="btn btn-sec btn-sm" onclick="Installer.reinstallTool('${t.id}')">Reinstall</button>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  // ── Install single tool ──────────────────────────────────────────────────────
  async function installTool(id, silent = false) {
    const tool = TOOLS.find(t => t.id === id);
    if (!tool) return;

    showLog();
    log(`\n── Installing: ${tool.name} ──`);

    if (tool.manualOnly) {
      log(`Manual install required. Open: ${tool.directUrl}`);
      if (tool.directUrl) window.open?.(tool.directUrl);
      return;
    }

    let success = false;

    // Try winget first
    if (tool.winget) {
      log(`$ winget install ${tool.winget} -e --silent --accept-source-agreements --accept-package-agreements`);
      const r = await nexus.execCmd(
        `winget install ${tool.winget} -e --silent --accept-source-agreements --accept-package-agreements`,
        null
      );
      log(r.stdout || '');
      if (r.stderr) log(`STDERR: ${r.stderr}`);
      success = r.code === 0 || (r.stdout||'').toLowerCase().includes('already installed') || (r.stdout||'').toLowerCase().includes('no applicable upgrade');
    }

    // Try direct install command if no winget or winget failed
    if (!success && tool.install) {
      log(`$ ${tool.install}`);
      const r = await nexus.execCmd(tool.install, null);
      log(r.stdout || '');
      if (r.stderr) log(r.stderr);
      success = r.code === 0;
    }

    // Run post-install steps
    if (success && tool.postInstall) {
      log(`\n── Post-install: ${tool.postInstall}`);
      const r = await nexus.execCmd(tool.postInstall, null);
      log(r.stdout || r.stderr || '');
    }

    // Re-check
    log(`\n── Verifying installation…`);
    // PATH may not update in same process — use a fresh cmd call
    if (tool.check) {
      const check = await nexus.execCmd(`cmd /c "${tool.check}"`, null);
      const out = (check.stdout + check.stderr).trim();
      if (check.code === 0 && (!tool.checkRegex || tool.checkRegex.test(out))) {
        checkResults[id] = { status:'ok', msg: out.split('\n')[0].slice(0,60) };
        log(`✅ Verified: ${out.split('\n')[0]}`);
      } else {
        checkResults[id] = { status:'missing', msg:'Installed but not in PATH yet — restart the app' };
        log(`⚠️  Installed but PATH not updated yet. Restart Nexus Agent after install.`);
      }
    } else {
      checkResults[id] = { status:'ok', msg:'Installed (manual verify)' };
    }

    if (!silent) { renderToolList(); toast(success ? `✅ ${tool.name} installed` : `⚠️ Check log for ${tool.name}`, success?'ok':'in'); }
    return success;
  }

  async function reinstallTool(id) { await installTool(id); }

  // ── Install required tools in sequence ──────────────────────────────────────
  async function installRequired() {
    if (installing) { toast('Already installing…','in'); return; }
    installing = true;
    showLog();
    log('═══ Installing REQUIRED tools ═══\n');
    const required = TOOLS.filter(t => t.required && checkResults[t.id]?.status !== 'ok');
    if (!required.length) { log('✅ All required tools already installed!'); installing=false; return; }
    for (const t of required) {
      await installTool(t.id, true);
      await sleep(500);
    }
    renderToolList();
    log('\n═══ Done. Restart the app if PATH was updated. ═══');
    toast('Required tools installation complete','ok');
    installing = false;
  }

  // ── Install all selected (checked) tools ────────────────────────────────────
  async function installAll() {
    if (installing) { toast('Already installing…','in'); return; }
    installing = true;
    showLog();
    log('═══ Installing ALL tools in current tab ═══\n');
    const tools = TOOLS.filter(t => t.category === currentInstTab && checkResults[t.id]?.status !== 'ok' && !t.manualOnly);
    if (!tools.length) { log('✅ All tools in this tab already installed!'); installing=false; return; }
    for (const t of tools) {
      await installTool(t.id, true);
      await sleep(500);
    }
    renderToolList();
    log('\n═══ Done. Restart the app if PATH was updated. ═══');
    toast(`Installed ${tools.length} tools`,'ok');
    installing = false;
  }

  // ── Full Ollama setup (the one the user is hitting) ──────────────────────────
  async function installOllamaFull() {
    if (installing) { toast('Already installing…','in'); return; }
    installing = true;
    showLog();
    log('═══════════════════════════════════════════════════');
    log('  FULL OLLAMA SETUP');
    log('  Installs: Visual C++ Redist → Git → Ollama → starts service');
    log('═══════════════════════════════════════════════════\n');

    // Step 1: Check + install Visual C++ Redistributable (Ollama depends on it)
    log('STEP 1/5: Visual C++ Redistributable 2015-2022 (Ollama dependency)\n');
    const vcCheck = await nexus.execCmd('reg query "HKLM\\SOFTWARE\\Microsoft\\VisualStudio\\14.0\\VC\\Runtimes\\x64" /v Version 2>nul', null);
    if (vcCheck.code === 0 && vcCheck.stdout.includes('REG_SZ')) {
      log('✅ Visual C++ Redistributable already installed\n');
    } else {
      log('Installing Visual C++ Redistributable...');
      log('$ winget install Microsoft.VCRedist.2015+.x64 -e --silent --accept-package-agreements --accept-source-agreements');
      const r = await nexus.execCmd('winget install Microsoft.VCRedist.2015+.x64 -e --silent --accept-package-agreements --accept-source-agreements', null);
      log(r.stdout || '');
      if (r.stderr) log(`STDERR: ${r.stderr}`);
      log(r.code === 0 ? '✅ Visual C++ Redistributable installed\n' : '⚠️ May need manual install from: https://aka.ms/vs/17/release/vc_redist.x64.exe\n');
    }
    await sleep(1000);

    // Step 2: Install Git if missing
    log('STEP 2/5: Git for Windows\n');
    const gitCheck = await nexus.execCmd('git --version', null);
    if (gitCheck.code === 0) {
      log(`✅ Git already installed: ${gitCheck.stdout.trim()}\n`);
    } else {
      log('Installing Git for Windows...');
      log('$ winget install Git.Git -e --silent --accept-package-agreements --accept-source-agreements');
      const r = await nexus.execCmd('winget install Git.Git -e --silent --accept-package-agreements --accept-source-agreements', null);
      log(r.stdout || '');
      if (r.stderr) log(`STDERR: ${r.stderr}`);
      log(r.code === 0 ? '✅ Git installed\n' : '⚠️ Git install may need retry\n');
      await sleep(2000);
    }

    // Step 3: Install Ollama
    log('STEP 3/5: Ollama\n');
    const ollamaCheck = await nexus.execCmd('ollama --version', null);
    if (ollamaCheck.code === 0 && ollamaCheck.stdout.trim()) {
      log(`✅ Ollama already installed: ${ollamaCheck.stdout.trim()}\n`);
    } else {
      log('Downloading and installing Ollama...');
      log('$ winget install Ollama.Ollama -e --accept-package-agreements --accept-source-agreements');
      const r = await nexus.execCmd('winget install Ollama.Ollama -e --accept-package-agreements --accept-source-agreements', null);
      log(r.stdout || '');
      if (r.stderr) log(`STDERR: ${r.stderr}`);
      if (r.code !== 0) {
        // Fallback: direct PowerShell download
        log('\nwinget failed — trying direct PowerShell download...');
        log('$ powershell -Command "Invoke-WebRequest -Uri https://ollama.com/download/OllamaSetup.exe -OutFile $env:TEMP\\OllamaSetup.exe; Start-Process $env:TEMP\\OllamaSetup.exe -ArgumentList \'/S\' -Wait"');
        const ps = await nexus.execCmd('powershell -Command "Invoke-WebRequest -Uri https://ollama.com/download/OllamaSetup.exe -OutFile $env:TEMP\\OllamaSetup.exe; Start-Process $env:TEMP\\OllamaSetup.exe -ArgumentList \'/S\' -Wait"', null);
        log(ps.stdout || '');
        if (ps.stderr) log(ps.stderr);
        log(ps.code === 0 ? '✅ Ollama installed via direct download\n' : '⚠️ Check https://ollama.com/download manually\n');
      } else {
        log('✅ Ollama installed via winget\n');
      }
      await sleep(3000); // Let installer finish
    }

    // Step 4: Start Ollama service
    log('STEP 4/5: Starting Ollama service\n');
    // First check if already running
    try {
      const ping = await nexus.httpRequest({ method:'GET', url:'http://localhost:11434', headers:{}, timeout:3 });
      if (ping.status > 0) {
        log('✅ Ollama service already running on port 11434\n');
      } else {
        throw new Error('not running');
      }
    } catch {
      log('Starting Ollama service...');
      // Start in background — Windows: use START or cmd /c with detach
      const r = await nexus.execCmd('start /B "" ollama serve', null);
      log(r.stdout || '(service starting in background)');
      await sleep(3000);
      // Verify it started
      try {
        const ping2 = await nexus.httpRequest({ method:'GET', url:'http://localhost:11434', headers:{}, timeout:5 });
        log(ping2.status > 0 ? '✅ Ollama service started on port 11434\n' : '⚠️ Service may still be starting\n');
      } catch {
        log('⚠️ Service start pending — try the Detect Models button in a moment\n');
      }
    }

    // Step 5: Pull a starter model
    log('STEP 5/5: Pull starter model (llama3.2:3b — 2GB, good for testing)\n');
    log('You can skip this and pull any model later. Pulling now...\n');
    log('$ ollama pull llama3.2:3b');
    log('(This downloads ~2GB — may take several minutes)\n');
    const pull = await nexus.execCmd('ollama pull llama3.2:3b', null);
    log(pull.stdout || '');
    if (pull.stderr) log(pull.stderr);
    if (pull.code === 0) {
      log('✅ llama3.2:3b ready to use!\n');
      // Auto-configure
      S.cfg.ollamaModel = 'llama3.2:3b';
      S.cfg.primaryProvider = 'ollama';
      S.cfg.ollamaUrl = 'http://localhost:11434';
      await nexus.saveConfig(S.cfg);
      updateStatus();
      renderTools();
    } else {
      log('⚠️ Model pull failed or Ollama needs PATH refresh.\n');
      log('After restarting the app: Settings → Local/Ollama → Pull Model → enter llama3.2:3b\n');
    }

    log('\n═══════════════════════════════════════════════════');
    log('  OLLAMA SETUP COMPLETE');
    log('  If any steps failed:');
    log('  1. Restart Nexus Agent (updates PATH)');
    log('  2. Go to Settings → Local/Ollama');
    log('  3. Click "Detect Running Models"');
    log('═══════════════════════════════════════════════════');

    await runAllChecks();
    toast('Ollama setup complete! Check log for details.', 'ok');
    installing = false;
  }

  // ── Install everything for a dev environment (run once on new machine) ────────
  async function fullDevSetup() {
    if (installing) return;
    installing = true;
    showLog();
    log('═══ FULL DEV ENVIRONMENT SETUP ═══\n');
    log('Installing: winget check → Git → Node.js → Python → npm globals → pip tools\n');

    const coreTools = TOOLS.filter(t => t.category === 'Core' && t.id !== 'winget');
    for (const t of coreTools) {
      if (checkResults[t.id]?.status === 'ok') {
        log(`✅ SKIP (already installed): ${t.name}`);
        continue;
      }
      await installTool(t.id, true);
      await sleep(1000);
    }

    log('\n═══ Core setup complete ═══');
    log('Restart Nexus Agent for PATH updates to take effect.');
    renderToolList();
    toast('Core dev tools installed','ok');
    installing = false;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function showLog() {
    const wrap = document.getElementById('inst-log-wrap');
    if (wrap) wrap.style.display = '';
  }

  function log(msg) {
    if (!logEl) { logEl = document.getElementById('inst-log'); }
    if (logEl) {
      logEl.textContent += msg + '\n';
      logEl.scrollTop = logEl.scrollHeight;
    }
    // Also append to terminal view for visibility
    if (typeof appendTerm === 'function') appendTerm(msg, 'inf');
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const esc   = s  => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // ── Public API ───────────────────────────────────────────────────────────────
  return {
    openWizard,
    runAllChecks,
    installTool,
    reinstallTool,
    installRequired,
    installAll,
    installOllamaFull,
    fullDevSetup,
    switchTab,
    TOOLS,
    get results() { return checkResults; },
  };

})();
