const { app, BrowserWindow, ipcMain, shell, dialog, Menu, net } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, execSync } = require('child_process');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// ─── Paths ────────────────────────────────────────────────────────────────────
const CONFIG_PATH   = path.join(app.getPath('userData'), 'nexus-config.json');
const WORKSPACE_DIR = path.join(os.homedir(), 'NexusAgent');
const MODELS_DIR    = path.join(os.homedir(), 'NexusAgent', '.models');
const LOGS_DIR      = path.join(os.homedir(), 'NexusAgent', '.logs');

function ensureDirs() {
  [WORKSPACE_DIR, MODELS_DIR, LOGS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
}

// ─── Config ───────────────────────────────────────────────────────────────────
function loadConfig() {
  try { if (fs.existsSync(CONFIG_PATH)) return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); } catch {}
  return {
    // ── Keys (all blank by default — user adds their own) ──
    anthropicKey: '', openaiKey: '', geminiKey: '', groqKey: '', hfToken: '',
    mistralKey: '', togetherKey: '', ollamaUrl: 'http://localhost:11434',
    lmstudioUrl: 'http://localhost:1234', openrouterKey: '',
    // ── FREE TIER DEFAULTS ── works at boot with zero config ──
    // Priority: OpenRouter free → HuggingFace serverless → Ollama local
    primaryProvider: 'openrouter',
    openrouterModel: 'meta-llama/llama-3.1-8b-instruct:free',
    hfModel:         'mistralai/Mistral-7B-Instruct-v0.3',
    hfInferenceMode: 'serverless',   // no key needed for public HF models
    ollamaUrl:       'http://localhost:11434',
    ollamaModel:     'llama3.2:3b',
    groqModel:       'llama-3.3-70b-versatile',
    // ── Agent defaults (conservative for free tier rate limits) ──
    maxTokens: 4096, temperature: 0.3, maxSteps: 15,
    autoExec: 'safe', workspace: WORKSPACE_DIR,
    hfLocalModelPath: '',
    customEndpointUrl: '', customEndpointKey: '', customEndpointModel: '',
  };
}
function saveConfig(cfg) { fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2)); }

// ─── Window ───────────────────────────────────────────────────────────────────
let mainWindow;
function createWindow() {
  ensureDirs();
  mainWindow = new BrowserWindow({
    width: 1480, height: 940, minWidth: 1100, minHeight: 720,
    frame: false, backgroundColor: '#07070d',
    icon: path.join(__dirname, '../assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
      webSecurity: false,   // allow local model file reads
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  Menu.setApplicationMenu(null);
}
app.whenReady().then(() => { createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ─── Window controls ──────────────────────────────────────────────────────────
ipcMain.on('win-minimize', () => mainWindow.minimize());
ipcMain.on('win-maximize', () => mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize());
ipcMain.on('win-close',    () => mainWindow.close());

// ─── Config IPC ──────────────────────────────────────────────────────────────
ipcMain.handle('get-config',   ()      => loadConfig());
ipcMain.handle('save-config',  (_, c)  => { saveConfig(c); return true; });
ipcMain.handle('get-workspace',()      => WORKSPACE_DIR);
ipcMain.handle('get-models-dir',()     => MODELS_DIR);

// ─── Dialogs ──────────────────────────────────────────────────────────────────
ipcMain.handle('open-workspace', () => shell.openPath(WORKSPACE_DIR));
ipcMain.handle('pick-folder', async () => {
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('pick-file', async (_, filters) => {
  const r = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'], filters: filters || [] });
  return r.canceled ? null : r.filePaths[0];
});

// ─── File system IPC ──────────────────────────────────────────────────────────
ipcMain.handle('list-files', (_, dir) => {
  const target = dir || WORKSPACE_DIR;
  if (!fs.existsSync(target)) return [];
  function walk(d, base, depth = 0) {
    if (depth > 6) return [];
    const items = [];
    try {
      for (const f of fs.readdirSync(d).sort()) {
        if (f.startsWith('.') && depth > 0) continue;
        const full = path.join(d, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) items.push({ name: f, path: full, type: 'dir', children: walk(full, base, depth+1) });
        else items.push({ name: f, path: full, type: 'file', size: stat.size, ext: path.extname(f).slice(1) });
      }
    } catch {}
    return items;
  }
  return walk(target, target);
});
ipcMain.handle('read-file',   (_, p)      => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } });
ipcMain.handle('write-file',  (_, p, c)   => { try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, c, 'utf8'); return true; } catch { return false; } });
ipcMain.handle('delete-file', (_, p)      => { try { fs.unlinkSync(p); return true; } catch { return false; } });
ipcMain.handle('rename-file', (_, o, n)   => { try { fs.renameSync(o, n); return true; } catch { return false; } });
ipcMain.handle('mkdir',       (_, p)      => { try { fs.mkdirSync(p, { recursive: true }); return true; } catch { return false; } });
ipcMain.handle('file-exists', (_, p)      => fs.existsSync(p));
ipcMain.handle('get-file-stat',(_, p)     => { try { const s = fs.statSync(p); return { size: s.size, mtime: s.mtimeMs }; } catch { return null; } });

// ─── Shell execution ──────────────────────────────────────────────────────────
const runningProcs = new Map();
ipcMain.handle('exec-cmd', async (_, cmd, cwd, envExtra) => {
  return new Promise((resolve) => {
    const workDir = cwd || WORKSPACE_DIR;
    const env = { ...process.env, ...(envExtra || {}) };
    const proc = spawn(cmd, [], { shell: true, cwd: workDir, env });
    const id = Date.now();
    runningProcs.set(id, proc);
    let stdout = '', stderr = '';
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => { runningProcs.delete(id); resolve({ code, stdout, stderr }); });
    setTimeout(() => { proc.kill('SIGTERM'); runningProcs.delete(id); resolve({ code: -1, stdout, stderr: stderr + '\n[TIMEOUT 60s]' }); }, 60000);
  });
});
ipcMain.handle('kill-all', () => { runningProcs.forEach(p => p.kill()); runningProcs.clear(); return true; });

// ─── Generic HTTP request (for AI APIs & HF) ─────────────────────────────────
ipcMain.handle('http-request', async (_, { method, url, headers, body, timeout }) => {
  return new Promise((resolve) => {
    try {
      const parsed  = new URL(url);
      const isHttps = parsed.protocol === 'https:';
      const lib     = isHttps ? https : http;
      const bodyBuf = body ? Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)) : null;
      const opts = {
        hostname: parsed.hostname,
        port:     parsed.port || (isHttps ? 443 : 80),
        path:     parsed.pathname + (parsed.search || ''),
        method:   method || 'GET',
        headers:  { ...(headers || {}), ...(bodyBuf ? { 'Content-Length': bodyBuf.length } : {}) },
      };
      const req = lib.request(opts, (res) => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let data;
          try { data = JSON.parse(raw); } catch { data = { _raw: raw }; }
          resolve({ status: res.statusCode, headers: res.headers, data });
        });
      });
      req.on('error', e => resolve({ status: 0, error: e.message }));
      if (timeout) req.setTimeout(timeout * 1000, () => { req.destroy(); resolve({ status: 0, error: 'Timeout' }); });
      if (bodyBuf) req.write(bodyBuf);
      req.end();
    } catch (e) { resolve({ status: 0, error: e.message }); }
  });
});

// ─── Streaming HTTP (SSE / chunked) for streaming inference ──────────────────
ipcMain.handle('http-stream', async (event, { url, method, headers, body }) => {
  return new Promise((resolve) => {
    try {
      const parsed  = new URL(url);
      const lib     = parsed.protocol === 'https:' ? https : http;
      const bodyBuf = body ? Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)) : null;
      const opts = {
        hostname: parsed.hostname, port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + (parsed.search || ''), method: method || 'POST',
        headers: { ...(headers || {}), ...(bodyBuf ? { 'Content-Length': bodyBuf.length } : {}) },
      };
      const req = lib.request(opts, (res) => {
        let full = '';
        res.on('data', chunk => {
          const str = chunk.toString();
          full += str;
          event.sender.send('stream-chunk', str);
        });
        res.on('end', () => resolve({ status: res.statusCode, full }));
      });
      req.on('error', e => resolve({ status: 0, error: e.message }));
      if (bodyBuf) req.write(bodyBuf);
      req.end();
    } catch (e) { resolve({ status: 0, error: e.message }); }
  });
});

// ─── HuggingFace model download ───────────────────────────────────────────────
ipcMain.handle('hf-download-model', async (event, { repoId, filename, hfToken }) => {
  const destPath = path.join(MODELS_DIR, repoId.replace('/', '--'), filename);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  if (fs.existsSync(destPath)) return { success: true, path: destPath, cached: true };

  const urlStr = `https://huggingface.co/${repoId}/resolve/main/${filename}`;
  return new Promise((resolve) => {
    const headers = { 'User-Agent': 'NexusAgent/1.0' };
    if (hfToken) headers['Authorization'] = `Bearer ${hfToken}`;
    const lib = https;
    function doReq(u) {
      const parsed = new URL(u);
      const opts = { hostname: parsed.hostname, path: parsed.pathname + (parsed.search || ''), method: 'GET', headers };
      const req = lib.request(opts, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) { doReq(res.headers.location); return; }
        if (res.statusCode !== 200) { resolve({ success: false, error: `HTTP ${res.statusCode}` }); return; }
        const total = parseInt(res.headers['content-length'] || '0');
        let received = 0;
        const ws = fs.createWriteStream(destPath);
        res.on('data', c => { received += c.length; ws.write(c); if (total) event.sender.send('hf-download-progress', { received, total, pct: Math.round(received/total*100) }); });
        res.on('end', () => { ws.end(); resolve({ success: true, path: destPath }); });
        res.on('error', e => { ws.destroy(); resolve({ success: false, error: e.message }); });
      });
      req.on('error', e => resolve({ success: false, error: e.message }));
      req.end();
    }
    doReq(urlStr);
  });
});

// ─── List downloaded models ───────────────────────────────────────────────────
ipcMain.handle('list-local-models', () => {
  if (!fs.existsSync(MODELS_DIR)) return [];
  const result = [];
  for (const repo of fs.readdirSync(MODELS_DIR)) {
    const repoPath = path.join(MODELS_DIR, repo);
    if (!fs.statSync(repoPath).isDirectory()) continue;
    for (const file of fs.readdirSync(repoPath)) {
      const fp = path.join(repoPath, file);
      const stat = fs.statSync(fp);
      result.push({ repo: repo.replace('--', '/'), file, path: fp, size: stat.size });
    }
  }
  return result;
});

// ─── Ollama: list models ──────────────────────────────────────────────────────
ipcMain.handle('ollama-list', async (_, baseUrl) => {
  return new Promise((resolve) => {
    try {
      const u = new URL((baseUrl || 'http://localhost:11434') + '/api/tags');
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.get({ hostname: u.hostname, port: u.port || 11434, path: u.pathname }, (res) => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(3000, () => { req.destroy(); resolve(null); });
    } catch { resolve(null); }
  });
});

// ── Extended exec with configurable timeout (for installs) ────────────────────
ipcMain.handle('exec-cmd-long', async (_, cmd, cwd, timeoutSecs) => {
  return new Promise((resolve) => {
    const workDir = cwd || WORKSPACE_DIR;
    const proc = spawn(cmd, [], { shell: true, cwd: workDir, env: process.env });
    let stdout = '', stderr = '';
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => resolve({ code, stdout, stderr }));
    const ms = (timeoutSecs || 300) * 1000;
    setTimeout(() => {
      try { proc.kill('SIGTERM'); } catch {}
      resolve({ code: -1, stdout, stderr: stderr + `\n[TIMEOUT after ${timeoutSecs}s]` });
    }, ms);
  });
});

// ── Check if a command/program exists on PATH ─────────────────────────────────
ipcMain.handle('check-cmd', async (_, cmd) => {
  return new Promise((resolve) => {
    const check = spawn('where', [cmd], { shell: true });
    let out = '';
    check.stdout.on('data', d => out += d);
    check.on('close', code => resolve({ found: code === 0, path: out.trim() }));
    setTimeout(() => { check.kill(); resolve({ found: false, path: '' }); }, 5000);
  });
});

// ── Open URL in default browser ───────────────────────────────────────────────
ipcMain.handle('open-url', (_, url) => {
  shell.openExternal(url);
  return true;
});

// ── Elevate and run a command (PowerShell RunAs) ──────────────────────────────
ipcMain.handle('run-elevated', async (_, cmd) => {
  return new Promise((resolve) => {
    // Use PowerShell Start-Process with RunAs verb for elevation
    const escaped = cmd.replace(/"/g, '\\"');
    const ps = `Start-Process cmd -ArgumentList '/c ${escaped}' -Verb RunAs -Wait`;
    const proc = spawn('powershell', ['-NoProfile', '-Command', ps], { shell: false });
    let stdout = '', stderr = '';
    proc.stdout.on('data', d => stdout += d.toString());
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', code => resolve({ code, stdout, stderr }));
    setTimeout(() => { proc.kill(); resolve({ code: -1, stdout, stderr: 'Timeout' }); }, 600000);
  });
});
