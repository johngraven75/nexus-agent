# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 3.x.x   | ✅ Active support |
| 2.x.x   | ⚠️ Security fixes only |
| 1.x.x   | ❌ End of life |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

To report a vulnerability, use GitHub's private vulnerability reporting:
**Security → Report a vulnerability** in this repository.

Or email the maintainer directly. Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if you have one)

You will receive acknowledgement within 48 hours and a fix timeline within 7 days.

---

## Security Architecture

### API Key Storage
- Keys stored **locally only** in `%APPDATA%\nexus-agent\nexus-config.json`
- File permissions restricted to current user on Windows
- Keys are **never logged**, **never transmitted** to any third party
- Keys only sent to the respective provider's official API endpoint

### Electron Security Configuration
```js
// src/main.js — enforced settings
webPreferences: {
  contextIsolation: true,    // ✅ Renderer cannot access Node APIs
  nodeIntegration: false,    // ✅ No direct Node.js in renderer
  preload: path.join(...),   // ✅ Safe IPC bridge only
  webSecurity: false,        // ⚠️ Required for local model file reads
}
```

### Shell Execution
- All `execCmd` calls run in the workspace directory by default
- No arbitrary code execution from AI responses without explicit tool call parsing
- Tool calls are parsed from a specific JSON format only

### Network
- All API calls made from the **main process** (Node.js), not the renderer
- No direct renderer-to-internet communication
- HTTPS only for all external API calls (enforced by `https` module)

### IPC Security
- `contextBridge.exposeInMainWorld` exposes only named, typed functions
- No `remote` module usage
- All dangerous operations (file write, exec) require explicit IPC calls

---

## Known Limitations

| Limitation | Risk | Mitigation |
|---|---|---|
| `webSecurity: false` | Local GGUF files need file:// access | Scoped to local model reading only |
| API keys in plain JSON | File system access on compromised machine | Use OS-level disk encryption |
| Shell execution via `execCmd` | Agent can run arbitrary commands | Sandboxed to workspace dir; safe mode requires confirmation |
| No code signing | Windows SmartScreen warning on first run | Expected for open-source builds; sign with EV cert for distribution |

---

## Responsible Disclosure Timeline

1. **Day 0** — Vulnerability reported privately
2. **Day 2** — Acknowledgement sent
3. **Day 7** — Severity assessment and fix timeline communicated
4. **Day 30** — Fix released (critical: Day 7)
5. **Day 37** — Public disclosure with CVE if applicable
