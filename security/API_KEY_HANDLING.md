# API Key Handling — Security Notes

## Storage
Keys are saved to `%APPDATA%\nexus-agent\nexus-config.json` via Electron's main process.

Windows NTFS permissions on `%APPDATA%` restrict access to the current user account.

## Transmission
Keys are only transmitted in HTTP `Authorization` headers to the respective provider:
- Anthropic: `x-api-key: sk-ant-…` → `api.anthropic.com`
- OpenAI: `Authorization: Bearer sk-…` → `api.openai.com`
- OpenRouter: `Authorization: Bearer sk-or-…` → `openrouter.ai`
- HuggingFace: `Authorization: Bearer hf_…` → `api-inference.huggingface.co`
- Groq: `Authorization: Bearer gsk_…` → `api.groq.com`

Keys are **never** sent to any other endpoint.

## Recommendations for Users
1. Use **read-only / restricted API keys** where providers allow
2. Enable **OS-level disk encryption** (BitLocker on Windows)
3. Do not store production/billing keys — use development keys with rate limits
4. Rotate keys regularly
5. Set spending limits on your API provider dashboards

## In-Memory Handling
Keys are held in `window.S.cfg` (renderer memory) for the session.
They are **not logged** to the terminal, console, or any file.
