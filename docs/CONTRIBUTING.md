# Contributing to Nexus Agent

## Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/nexus-agent.git`
3. Install dependencies: `npm install`
4. Run in development: `npm start`

## Branch Strategy
- `main` — stable, released code
- `develop` — integration branch for features
- `feature/...` — feature branches (branch from `develop`)
- `fix/...` — bug fix branches
- `chore/...` — maintenance (deps, CI, docs)

## Pull Request Requirements
- All PR checks must pass (lint, security, size)
- Add/update relevant docs for new features
- Add entry to CHANGELOG.md under `[Unreleased]`
- Keep PRs focused — one feature/fix per PR

## Adding a New AI Provider
1. Add provider config to `DEFAULT_CONFIG` in `src/modules/free-tier.js`
2. Add adapter function in `src/app.js` (follow `callOpenAI` pattern)
3. Add case to `callAI()` switch
4. Add to `activeKey()` map
5. Add settings inputs in `src/index.html` Settings → Providers
6. Add test entry in `MODEL_DETAILS` for the detail card
7. Update `docs/PROVIDERS.md`

## Adding a New Free Model
In `src/modules/free-tier.js`:
- OpenRouter free: add to `OR_FREE_MODELS.text|vision|uncensored|code`
- HuggingFace free: add to `HF_FREE_MODELS.text|vision|uncensored|code`
- Ollama: add to `OLLAMA_MODELS.text|vision|uncensored|code`

Then update the corresponding `<select>` optgroup in `src/index.html`.

## Adding a New Skill
In `src/modules/skills.js`, add to `CATALOG`:
```js
{
  id:       'unique_id',
  category: 'Code|Architecture|Docs|DevOps|Security|Data|Content|Agent|Research',
  origin:   ['Platform1','Platform2'],  // where skill pattern comes from
  name:     'Display Name',
  icon:     '⚡',
  desc:     'One-sentence description',
  prompt:   `System prompt with {{param}} placeholders`,
  params:   [{ key:'param', label:'Label', type:'select|text', options:['a','b'] }],
}
```

## Code Style
- 2-space indentation
- Single quotes for strings
- Semicolons optional (existing code omits them in some places)
- Keep functions under 80 lines where possible
- Comment complex logic
