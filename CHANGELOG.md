# Changelog

All notable changes to Nexus Agent are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.2.0] — 2025-09-23

### Added
- **Free multimodal model catalog** across all three free providers
  - OpenRouter: Llama 3.2 Vision 11B/90B, Qwen2-VL, Gemma 3, Pixtral 12B, UI-TARS 72B
  - HuggingFace: LLaVA 1.5/1.6, Phi-3.5 Vision, Qwen2-VL, BLIP-2, ViT-GPT2
  - Ollama: LLaVA 7B/13B/34B, Moondream, LLaVA-Llama3, MiniCPM-V, Qwen2-VL
- **Free uncensored model catalog**
  - OpenRouter: Hermes 3 405B/70B, MythoMax 13B, Euryale 70B, Goliath 120B
  - HuggingFace: Dolphin 2.9, Nous Hermes 2, WizardLM, OpenAssistant
  - Ollama: Dolphin 3, Dolphin Mixtral, Nous Hermes2, Wizard-Vicuna, Orca Mini
- **Free code model catalog** across all providers
- **Image attach button** in chat — send images to vision models
- **Ollama model browser** with tabbed categories (Text/Vision/Uncensored/Code) and Pull+Use buttons
- **"FREE TIER" badge** in status bar when using a free provider
- Auto-detection of installed Ollama models with vision/uncensored badges

### Changed
- OpenRouter model select now has 4 categories: Text, Vision, Uncensored, Code
- HuggingFace model select now has 4 categories: Text, Vision, Uncensored, Code
- Default HuggingFace inference mode changed to "Serverless (no key needed)"

---

## [3.1.0] — 2025-09-22

### Fixed
- **Dependency installer** — old `installOllama` was a single winget call with no error handling
- Full 5-step Ollama setup now installs: Visual C++ Redist → Git → Ollama → starts service → pulls model
- Added PowerShell fallback download if winget fails

### Added
- **Dependency Wizard** with 22 tools across 5 categories
- **Full Ollama Setup** one-click button
- **Start Service** button for Ollama
- Dependency Wizard sidebar shortcut

---

## [3.0.0] — 2025-09-21

### Added
- **App Doctor** — 17 automated project health checks + auto-fix
- **Media Generation** — 8 image providers + 8 video providers
- **Connectors Catalog** — 60+ platform integrations
- **Skills Catalog** — 40+ AI skills from ChatGPT, Copilot, Devin, Manus, Cursor
- **Free Tier Manager** — auto-detects best working free provider at boot
- Setup banner with 4 free provider options at first launch
- HuggingFace model search with detail panel and GGUF download
- Provider model detail cards in Settings
- Quick-pick buttons for popular HF models
- Key auto-detection from prefix (sk-ant-, sk-or-, hf_, gsk_)

---

## [2.0.0] — 2025-09-20

### Added
- 11 AI providers: Anthropic, OpenAI, Gemini, Groq, Mistral, Together, OpenRouter, HuggingFace, Ollama, LM Studio, Custom
- HuggingFace Inference API + Dedicated Endpoints + GGUF model download
- Local model support (Ollama + LM Studio)
- Full file editor view
- Terminal view with command history
- Right panel: Plan tracker, file tree, tools list, context editor

---

## [1.0.0] — 2025-09-19

### Added
- Initial release
- Autonomous agent with file I/O and shell execution tools
- Anthropic Claude, OpenAI, Google Gemini support
- Electron Windows x64 installer
