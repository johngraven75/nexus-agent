# Threat Model — Nexus Agent

## Assets
- **API keys** stored in `nexus-config.json`
- **Workspace files** created/modified by the agent
- **Downloaded GGUF models** in `~/NexusAgent/.models/`
- **Chat history** (in-memory only, not persisted)

## Threat Actors
| Actor | Capability | Likelihood |
|---|---|---|
| Malicious local process | Read `%APPDATA%` files | Low-Medium |
| Prompt injection via tool output | Manipulate agent actions | Medium |
| Malicious AI-generated code | Executed via `run_command` | Medium |
| Supply chain attack (npm) | Compromised dependency | Low |
| Network MITM | Intercept API calls | Low (HTTPS) |

## Mitigations
| Threat | Mitigation |
|---|---|
| API key theft | OS-level file permissions; recommend disk encryption |
| Prompt injection | Tool output clearly labeled `[TOOL_RESULT]`; model instructed not to follow injected instructions |
| Malicious agent commands | `autoExec: safe` mode asks confirmation for write ops |
| Dependency attack | `npm audit` in CI; pinned electron version |
| MITM | HTTPS enforced; no certificate bypass |

## Out of Scope
- Attacks requiring physical machine access
- Compromised Windows OS
- Vulnerabilities in third-party AI provider APIs
