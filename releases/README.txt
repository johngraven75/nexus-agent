╔══════════════════════════════════════════════════════════════╗
║  NEXUS AGENT v3 · Windows x64                               ║
║  Autonomous Software Engineering AI Platform                ║
╚══════════════════════════════════════════════════════════════╝

INSTALL:
  Extract ZIP → double-click INSTALL.bat
  OR run win-unpacked\Nexus Agent.exe directly

DEPENDENCY WIZARD (NEW):
  Settings → Local/Ollama → Dependency Wizard
  OR click "Dep Wizard" in the left sidebar

  The wizard detects and installs:
  ┌─ Core ─────────────────────────────────────────────┐
  │  Git for Windows · Node.js LTS · Python 3.12       │
  │  pnpm/yarn/ts-node · pipenv/poetry/virtualenv      │
  ├─ Local AI ─────────────────────────────────────────┤
  │  Ollama + service start · NVIDIA CUDA (optional)   │
  │  LM Studio (manual) · llama-cpp-python             │
  ├─ Build Tools ──────────────────────────────────────┤
  │  Make · CMake · Rust/Cargo · .NET Runtime 8        │
  ├─ DevOps ───────────────────────────────────────────┤
  │  Docker Desktop · kubectl · GitHub CLI · AWS CLI   │
  │  Azure CLI                                         │
  └─ AI/ML ────────────────────────────────────────────┘
     PyTorch · HuggingFace Transformers + Diffusers
     LangChain + LlamaIndex · llama-cpp-python

OLLAMA FULL SETUP (one click):
  Settings → Local/Ollama → "Full Ollama Setup" button
  Installs in order:
  1. Visual C++ Redistributable 2015-2022 (Ollama needs this)
  2. Git for Windows
  3. Ollama (via winget, falls back to direct download)
  4. Starts ollama serve on port 11434
  5. Pulls llama3.2:3b (2GB starter model)
  6. Auto-sets provider to Ollama in Settings

  After install: restart the app to refresh PATH,
  then Settings → Local/Ollama → Detect Models.

AI PROVIDERS (11):
  Anthropic · OpenAI · Gemini · Groq · Mistral ·
  Together · OpenRouter · HuggingFace · Ollama ·
  LM Studio · Custom Endpoint

IMAGE GEN (8): DALL-E 3/2 · Stable Diffusion XL/Core/Ultra ·
  Flux Schnell/Dev/Pro · HuggingFace · Ideogram · GetImg.ai

VIDEO GEN (8): Runway Gen-4/Gen-3 · Kling AI · Luma Ray 2 ·
  Pika · MiniMax/Hailuo · Sora

CONNECTORS: 60+ (GitHub, Slack, Notion, Stripe, AWS, GCP…)
SKILLS: 40+ (from ChatGPT, Copilot, Devin, Manus, Cursor…)
APP DOCTOR: project health checks + auto-fix

WORKSPACE:  ~/NexusAgent
MODELS:     ~/NexusAgent/.models
CONFIG:     %APPDATA%\nexus-agent\nexus-config.json
