# 🤖 Nexus Agent

> Autonomous Software Engineering AI Platform for Windows

[![Version](https://img.shields.io/badge/version-3.2.0-6c63ff?style=flat-square)](https://github.com/johngraven75/nexus-agent/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20x64-0078D4?style=flat-square&logo=windows)](https://github.com/johngraven75/nexus-agent/releases)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-27-47848F?style=flat-square&logo=electron)](https://electronjs.org)
[![Free Tier](https://img.shields.io/badge/free%20tier-OpenRouter%20%7C%20HuggingFace%20%7C%20Ollama-4ade80?style=flat-square)](docs/FREE_TIER.md)

A fully autonomous software engineering AI harness. Build complete, production-ready software from a description — code, tests, configs, Docker, CI/CD and all. Runs on 11 AI providers including fully free tiers with multimodal and uncensored model support.

---

## ✨ Features

### 🤖 Autonomous Agent
- **Multi-step planning** with visible plan panel and step tracking
- **11 built-in tools**: file I/O, shell execution, web search, plan management
- **7 agent modes**: Autonomous, Chat, Code, Plan, Debug, Architect, Docs, Security
- **Skill injection**: 40+ skills from ChatGPT, Copilot, Devin, Manus, Cursor
- **Context-aware**: inject project constraints into every agent run

### 🌐 AI Providers (11 supported)
| Provider | Free Tier | Best For |
|---|---|---|
| **OpenRouter** | ✅ 15+ free models | Best quality free, multimodal |
| **HuggingFace** | ✅ No key needed | Zero-config, vision models |
| **Ollama** | ✅ Fully local | Privacy, offline, uncensored |
| **Groq** | ✅ Free tier | Ultra-fast inference |
| Anthropic Claude | API key | claude-sonnet-4-6, opus-5 |
| OpenAI | API key | GPT-4o, o3, o4-mini |
| Google Gemini | API key | 2.0-flash, 2.0-pro |
| Mistral AI | API key | codestral, large |
| Together AI | API key | Llama 405B, DeepSeek |
| OpenRouter (paid) | Credits | 1000+ models |
| Custom Endpoint | — | Any OpenAI-compatible API |

### 👁️ Multimodal Models (free)
- **OpenRouter**: Llama 3.2 Vision 11B/90B, Qwen2-VL 7B, Gemma 3 12B, Pixtral 12B, UI-TARS 72B
- **HuggingFace**: LLaVA 1.5/1.6, Phi-3.5 Vision, Qwen2-VL, BLIP-2, ViT-GPT2
- **Ollama**: LLaVA 7B/13B/34B, Moondream, LLaVA-Llama3, MiniCPM-V, Qwen2-VL

### 🔓 Uncensored Models (free)
- **OpenRouter**: Hermes 3 Llama 405B, MythoMax 13B, Euryale 70B, Goliath 120B
- **HuggingFace**: Dolphin 2.9 Llama3, Nous Hermes 2, WizardLM, OpenAssistant
- **Ollama**: Dolphin 3, Dolphin Mixtral, Nous Hermes2, Wizard-Vicuna, Orca Mini

### 🎨 Media Generation
- **8 image providers**: DALL-E 3/2, Stable Diffusion XL/Core/Ultra, Flux Schnell/Dev/Pro, HuggingFace, Ideogram, GetImg.ai
- **8 video providers**: Runway Gen-4/Gen-3, Kling AI 2.1, Luma Ray 2, Pika 2.1, MiniMax, Sora
- Image-to-video, real-time progress, workspace save, generation history

### 🔌 Connectors (60+)
GitHub · GitLab · Azure DevOps · Jira · Linear · Vercel · Netlify · AWS · GCP · Azure · Slack · Discord · Teams · Gmail · Notion · Airtable · Stripe · HubSpot · Salesforce · Asana · Trello · Replicate · ElevenLabs · Pinecone · and more

### ⭐ Skills (40+)
Code Generator · Reviewer · Refactorer · Test Generator · Debug Agent · API Designer · SQL Wizard · System Designer · Security Auditor · Threat Modeler · CI/CD Generator · Kubernetes Configs · Terraform · Full-Stack Builder · and more

### 🩺 App Doctor
17 automated project health checks with one-click auto-fix and AI deep analysis

### 🔧 Dependency Wizard
Installs Git, Node.js, Python, Docker, CUDA, Ollama, and 20+ tools automatically

---

## 🚀 Quick Start

### Option 1 — No install needed (zero config)
```
1. Download Nexus-Agent-v3.2-Windows-x64.zip from Releases
2. Extract anywhere
3. Run win-unpacked\Nexus Agent.exe
4. App auto-detects HuggingFace serverless (no key needed)
5. Start typing
```

### Option 2 — Install with shortcuts
```
1. Extract the zip
2. Double-click INSTALL.bat
3. Desktop shortcut created automatically
```

### Option 3 — Get a free API key (best quality)
```
OpenRouter (recommended):
  → https://openrouter.ai/keys (free, no credit card)
  → Settings → Providers → paste key → Save
  → Uses Llama 3.1 8B by default (free)

Groq (ultra-fast):
  → https://console.groq.com/keys (free tier)
  → Settings → Providers → Groq → paste key
```

---

## 📁 Repository Structure

```
nexus-agent/
├── src/                          # Application source
│   ├── main.js                   # Electron main process
│   ├── preload.js                # IPC bridge (renderer ↔ main)
│   ├── index.html                # UI shell (all views)
│   ├── app.js                    # Application logic + AI adapters
│   └── modules/
│       ├── free-tier.js          # Free provider catalog + auto-detect
│       ├── installer.js          # Dependency wizard (22 tools)
│       ├── doctor.js             # App Doctor (17 health checks)
│       ├── media.js              # Image + video generation (16 providers)
│       ├── connectors.js         # 60+ platform connectors
│       └── skills.js             # 40+ AI skills catalog
├── assets/
│   ├── icon.ico                  # Windows icon (256x256)
│   └── icon.png                  # Source icon
├── .github/
│   ├── workflows/
│   │   ├── build.yml             # CI build + release workflow
│   │   ├── security.yml          # CodeQL + dependency scan
│   │   └── update-models.yml     # Monthly free model list refresh
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── docs/
│   ├── FREE_TIER.md              # Free provider setup guide
│   ├── MULTIMODAL.md             # Vision model usage
│   ├── UNCENSORED.md             # Uncensored model guide
│   ├── PROVIDERS.md              # All provider documentation
│   ├── SKILLS.md                 # Skills catalog reference
│   ├── CONNECTORS.md             # Connector setup guide
│   ├── ARCHITECTURE.md           # Technical architecture
│   └── CONTRIBUTING.md           # Contribution guide
├── security/
│   ├── SECURITY.md               # Security policy
│   ├── THREAT_MODEL.md           # Threat model
│   └── API_KEY_HANDLING.md       # Key storage security notes
├── scripts/
│   ├── build.sh                  # Linux/Mac build script
│   ├── build.bat                 # Windows build script
│   └── release.sh                # Release automation
├── releases/
│   ├── INSTALL.bat               # Windows installer script
│   └── README.txt                # End-user readme
├── package.json                  # Electron + builder config
├── .gitignore
├── CHANGELOG.md
├── LICENSE
└── README.md                     # This file
```

---

## 🏗️ Development

### Prerequisites
- Node.js 18+ LTS
- npm 9+
- Windows x64 (for building the Windows target)

### Setup
```bash
git clone https://github.com/johngraven75/nexus-agent.git
cd nexus-agent
npm install
npm start          # Run in development mode
```

### Build Windows installer
```bash
npm run build      # Produces dist/Nexus Agent-*.zip
```

### Environment
The app stores config at `%APPDATA%\nexus-agent\nexus-config.json`.
Workspace files land in `~/NexusAgent/`.
Downloaded GGUF models go to `~/NexusAgent/.models/`.

---

## 🔐 Security

API keys are stored locally in `%APPDATA%\nexus-agent\nexus-config.json`.
They are **never transmitted** except directly to the respective provider's API.
Shell command execution is sandboxed to the workspace directory.
See [security/SECURITY.md](security/SECURITY.md) for full policy.

To report a vulnerability: see [SECURITY.md](security/SECURITY.md).

---

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history.

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

## 🙏 Acknowledgements

Built on Electron. AI adapters for Anthropic, OpenAI, Google, Groq, Mistral, Together AI, OpenRouter, HuggingFace, Ollama, LM Studio. Skills adapted from patterns in ChatGPT, Claude, GitHub Copilot, Cursor, Devin, and Manus.
