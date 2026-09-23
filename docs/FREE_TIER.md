# Free Tier Setup Guide

Nexus Agent works **at first launch with zero configuration** via HuggingFace serverless inference.
For best quality, get a free OpenRouter key (no credit card required).

## Option 1 — HuggingFace Serverless (zero config, works instantly)
- No account needed for public models
- Models: Mistral 7B, Zephyr, Phi-3, Qwen 2.5, Gemma 2, LLaVA (vision), Dolphin (uncensored)
- Limitation: first call may take ~20s while model loads (cold start)
- Go to Settings → HuggingFace → set mode to "Serverless (free)"

## Option 2 — OpenRouter Free (best quality, needs free account)
1. Sign up at https://openrouter.ai (no credit card)
2. Go to https://openrouter.ai/keys → create a key
3. In Nexus Agent: Settings → Providers → OpenRouter → paste key → Save
4. Default model: `meta-llama/llama-3.1-8b-instruct:free`

### All OpenRouter free models
| Model | Category | Context |
|---|---|---|
| `meta-llama/llama-3.1-8b-instruct:free` | Text ★ | 131K |
| `meta-llama/llama-3.2-11b-vision-instruct:free` | Vision ★ | 131K |
| `meta-llama/llama-3.2-90b-vision-instruct:free` | Vision (large) | 131K |
| `qwen/qwen-2-vl-7b-instruct:free` | Vision/OCR | 32K |
| `google/gemma-3-12b-it:free` | Multimodal | 131K |
| `mistralai/pixtral-12b:free` | Vision | 131K |
| `nousresearch/hermes-3-llama-3.1-405b:free` | Uncensored ★ | 131K |
| `nousresearch/hermes-3-llama-3.1-70b:free` | Uncensored | 131K |
| `gryphe/mythomax-l2-13b:free` | Creative/Uncensored | 4K |
| `qwen/qwen-2.5-coder-7b-instruct:free` | Code | 131K |
| `qwen/qwen-2.5-coder-32b-instruct:free` | Code (large) | 131K |
| `deepseek/deepseek-r1:free` | Reasoning | 164K |

## Option 3 — Ollama Local (fully offline, no limits)
1. Click "Dep Wizard" in sidebar → "Full Ollama Setup"
2. Installs: Visual C++ Redist → Git → Ollama → starts service → pulls llama3.2:3b
3. Pull additional models from the Ollama browser in Settings → Local/Ollama

### Recommended Ollama models by use case
| Use Case | Model | Size |
|---|---|---|
| General (starter) | `llama3.2:3b` | 2GB |
| Best quality | `llama3.1:8b` | 4.7GB |
| Vision | `llava:7b` | 4.5GB |
| Vision (tiny) | `moondream` | 1.7GB |
| Uncensored | `dolphin3` | 4.7GB |
| Code | `qwen2.5-coder:7b` | 4.7GB |

## Option 4 — Groq Free Tier (ultra-fast, free)
1. Sign up at https://console.groq.com (free, no credit card)
2. Create API key → copy it
3. Settings → Providers → Groq → paste key → Save
4. Default: `llama-3.3-70b-versatile` (500+ tokens/sec)
