# Technical Architecture

## Overview
Nexus Agent is an Electron 27 desktop application for Windows x64.
It provides a chat interface backed by multiple AI provider adapters,
with autonomous agent capabilities using a set of built-in tools.

## Process Model
```
┌─────────────────────────────────┐
│  Renderer Process (Chromium)    │
│  ├── index.html (UI)            │
│  ├── app.js (logic + adapters)  │
│  └── modules/                  │
│      ├── free-tier.js           │
│      ├── installer.js           │
│      ├── doctor.js              │
│      ├── media.js               │
│      ├── connectors.js          │
│      └── skills.js              │
│                                 │
│  contextIsolation: true         │
│  nodeIntegration: false         │
└──────────┬──────────────────────┘
           │ IPC (contextBridge)
           │ nexus.httpRequest()
           │ nexus.execCmd()
           │ nexus.writeFile()
           │ etc.
┌──────────▼──────────────────────┐
│  Main Process (Node.js)         │
│  ├── main.js                    │
│  ├── https (all API calls)      │
│  ├── fs (file operations)       │
│  └── child_process (shell)      │
└─────────────────────────────────┘
```

## AI Provider Adapters
All provider calls go through `callAI(system, messages, opts)` which
dispatches to the appropriate provider based on `S.cfg.primaryProvider`:

```
callAI()
  ├── callAnthropic()     → api.anthropic.com/v1/messages
  ├── callOpenAI()        → api.openai.com/v1/chat/completions
  ├── callGemini()        → generativelanguage.googleapis.com
  ├── callOpenRouter()    → openrouter.ai/api/v1/chat/completions
  ├── callHuggingFaceAuto() → api-inference.huggingface.co
  ├── callOllama()        → localhost:11434/api/chat
  └── callCustom()        → user-configured endpoint
```

## Agent Loop
```
sendMsg()
  └── agentLoop(task)
        ├── callAI(AGENT_SYSTEM, messages)
        ├── parseTool(reply) → { tool, args }
        ├── execTool(tool, args)
        │     ├── read_file / write_file / list_files / delete_file
        │     ├── run_command → nexus.execCmd()
        │     ├── search_web → DuckDuckGo API
        │     ├── create_plan / update_plan → renderPlan()
        │     ├── think → sysMsg()
        │     └── task_complete → markPlanDone()
        └── repeat up to maxSteps
```

## Config Storage
`%APPDATA%\nexus-agent\nexus-config.json` — all provider keys, model selections, preferences.
Read at boot via `ipcMain.handle('get-config')`, written on save.

## Module Loading Order
```html
<script src="modules/free-tier.js"></script>    <!-- 1. Free model catalog -->
<script src="modules/installer.js"></script>    <!-- 2. Dependency wizard -->
<script src="modules/doctor.js"></script>       <!-- 3. App health checks -->
<script src="modules/media.js"></script>        <!-- 4. Image/video gen -->
<script src="modules/connectors.js"></script>   <!-- 5. Platform connectors -->
<script src="modules/skills.js"></script>       <!-- 6. AI skills catalog -->
<script src="app.js"></script>                  <!-- 7. Main app logic -->
```
