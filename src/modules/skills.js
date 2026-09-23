/* ═══════════════════════════════════════════════════════
   NEXUS AGENT — Skills & Plugins Catalog
   All known AI skills from ChatGPT, Claude, Codex,
   Manus, GitHub Copilot, Cursor, Devin, and more —
   deduplicated and adapted for Nexus Agent
═══════════════════════════════════════════════════════ */

window.Skills = (() => {

  // ── Master skills catalog ──────────────────────────────────────────────────
  // Each skill has: id, name, category, origin (platforms it came from),
  // prompt (the system prompt / instruction that enables it),
  // and params (user-configurable inputs)
  const CATALOG = [

    // ════════════════════════════════════════════
    //  CODE GENERATION & REVIEW
    // ════════════════════════════════════════════
    { id:'code_gen',        category:'Code',   origin:['Codex','Copilot','ChatGPT','Claude','Cursor'],
      name:'Code Generator', icon:'⌨️',
      desc:'Generate clean, production-ready code in any language from a description.',
      prompt:`You are an expert software engineer. Generate clean, well-commented, production-ready code. Include: error handling, edge cases, type hints/annotations where applicable, and a brief usage example. Language: {{language}}. Framework: {{framework}}.`,
      params:[{ key:'language', label:'Language', type:'select', options:['Auto-detect','Python','JavaScript','TypeScript','Rust','Go','Java','C++','C#','Ruby','PHP','Swift','Kotlin','SQL','Bash'] },{ key:'framework', label:'Framework (optional)', type:'text', placeholder:'React, FastAPI, Django…' }] },

    { id:'code_review',     category:'Code',   origin:['Copilot','Claude','Manus','Devin'],
      name:'Code Reviewer', icon:'🔍',
      desc:'Deep code review: bugs, security vulnerabilities, performance, style.',
      prompt:`You are a senior engineer doing a thorough code review. Analyze for: 1) Bugs & logic errors, 2) Security vulnerabilities (OWASP Top 10), 3) Performance issues, 4) Code style & best practices, 5) Missing tests, 6) Documentation gaps. For each issue: severity (Critical/High/Medium/Low), location, explanation, and fixed code snippet. Be specific and actionable. Focus: {{focus}}.`,
      params:[{ key:'focus', label:'Focus area', type:'select', options:['All (comprehensive)','Security only','Performance only','Style & readability','Bugs only'] }] },

    { id:'refactor',        category:'Code',   origin:['Copilot','Cursor','Claude','ChatGPT'],
      name:'Code Refactorer', icon:'🔧',
      desc:'Refactor code for readability, performance, and maintainability.',
      prompt:`You are an expert at code refactoring. Refactor the provided code to: improve readability, reduce complexity, follow SOLID principles, eliminate code smells, and improve performance where possible. Preserve all existing behavior. Explain each significant change. Style: {{style}}.`,
      params:[{ key:'style', label:'Refactor goal', type:'select', options:['General cleanup','Performance','Readability','SOLID principles','Modern idioms','Split into functions','Add TypeScript types'] }] },

    { id:'test_gen',        category:'Code',   origin:['Codex','Copilot','ChatGPT','Devin','Manus'],
      name:'Test Generator', icon:'🧪',
      desc:'Generate comprehensive unit, integration, and E2E tests.',
      prompt:`You are a testing expert. Generate comprehensive tests for the provided code. Include: happy path, edge cases, error cases, boundary conditions, and mocks/stubs where needed. Framework: {{framework}}. Coverage target: {{coverage}}. Write tests that actually catch real bugs.`,
      params:[{ key:'framework', label:'Test framework', type:'select', options:['Jest','Pytest','Vitest','Mocha','JUnit','Go test','RSpec','PHPUnit','Cypress (E2E)','Playwright (E2E)'] },{ key:'coverage', label:'Coverage goal', type:'select', options:['80%','90%','100% (critical paths)','Full branch coverage'] }] },

    { id:'debug_agent',     category:'Code',   origin:['ChatGPT','Claude','Devin','Cursor'],
      name:'Debug Agent', icon:'🐞',
      desc:'Diagnose errors with root cause analysis and fixes.',
      prompt:`You are an expert debugger. Analyze the error/bug provided. Provide: 1) Root cause analysis, 2) Why this error occurs, 3) Step-by-step fix, 4) Code patch, 5) How to prevent this class of bug in the future. Be specific about file and line numbers when mentioned.`,
      params:[] },

    { id:'code_explain',    category:'Code',   origin:['ChatGPT','Claude','Copilot','Codex'],
      name:'Code Explainer', icon:'📖',
      desc:'Explain code at any level — from beginner to expert.',
      prompt:`Explain the provided code clearly and thoroughly. Audience: {{audience}}. Cover: what it does, how it works step by step, key patterns used, potential gotchas, and practical examples of when/why you'd use this. Use analogies where helpful.`,
      params:[{ key:'audience', label:'Audience level', type:'select', options:['Complete beginner','Junior developer','Senior developer','Domain expert'] }] },

    { id:'api_design',      category:'Code',   origin:['ChatGPT','Claude','Manus'],
      name:'API Designer', icon:'🔌',
      desc:'Design RESTful or GraphQL APIs with best practices.',
      prompt:`You are an API design expert. Design a {{style}} API for the described use case. Include: endpoints/types, request/response schemas, authentication strategy, error handling, versioning approach, rate limiting, and OpenAPI 3.0 spec. Follow REST/GraphQL best practices. Consider: pagination, filtering, idempotency.`,
      params:[{ key:'style', label:'API style', type:'select', options:['REST','GraphQL','gRPC','WebSocket','tRPC'] }] },

    { id:'sql_gen',         category:'Code',   origin:['ChatGPT','Codex','Claude','Manus'],
      name:'SQL Wizard', icon:'🗄️',
      desc:'Write optimized SQL queries, schemas, and migrations.',
      prompt:`You are a database expert. Write optimized {{dialect}} SQL for the described task. Include: query optimization hints, index recommendations, explain plan considerations, and alternative approaches where applicable. For schemas: include constraints, indexes, and normalization rationale.`,
      params:[{ key:'dialect', label:'SQL dialect', type:'select', options:['PostgreSQL','MySQL','SQLite','SQL Server','BigQuery','Snowflake','DuckDB','MongoDB (MQL)'] }] },

    { id:'regex_gen',       category:'Code',   origin:['ChatGPT','Copilot','Claude'],
      name:'Regex Builder', icon:'🔤',
      desc:'Build, explain, and test regular expressions.',
      prompt:`You are a regex expert. Create a regular expression for: {{task}}. Provide: the regex pattern, explanation of each component, test cases (matches and non-matches), language-specific implementation, and edge cases to watch for. Flavor: {{flavor}}.`,
      params:[{ key:'task', label:'What to match', type:'text', placeholder:'e.g. email addresses, US phone numbers' },{ key:'flavor', label:'Regex flavor', type:'select', options:['JavaScript','Python','PCRE','Go','Java'] }] },

    { id:'dockerfile_gen',  category:'Code',   origin:['ChatGPT','Claude','Manus','Copilot'],
      name:'Dockerfile Generator', icon:'🐳',
      desc:'Generate optimized, secure Dockerfiles and compose files.',
      prompt:`You are a Docker and container expert. Generate an optimized Dockerfile for {{stack}}. Include: multi-stage builds where applicable, minimal base images, security best practices (non-root user, no secrets in layers), proper layer caching, health checks, and docker-compose.yml. Optimize for {{goal}}.`,
      params:[{ key:'stack', label:'Stack/language', type:'text', placeholder:'Node.js + PostgreSQL, Python FastAPI…' },{ key:'goal', label:'Optimize for', type:'select', options:['Small image size','Fast builds','Security','Development experience','Production'] }] },

    // ════════════════════════════════════════════
    //  ARCHITECTURE & DESIGN
    // ════════════════════════════════════════════
    { id:'system_design',   category:'Architecture', origin:['ChatGPT','Claude','Manus'],
      name:'System Designer', icon:'🏗️',
      desc:'Design scalable system architectures with diagrams and trade-off analysis.',
      prompt:`You are a principal software architect. Design a system architecture for: {{system}}. Scale: {{scale}}. Include: component diagram (ASCII art), data flow, technology stack choices with rationale, scalability approach, failure modes and mitigation, security architecture, data model overview, and estimated infrastructure costs. Trade-off analysis for key decisions.`,
      params:[{ key:'system', label:'System to design', type:'text', placeholder:'e.g. Real-time chat app, E-commerce platform' },{ key:'scale', label:'Scale', type:'select', options:['MVP (< 1000 users)','Growth (10k-100k users)','Scale (1M+ users)','Hyperscale (100M+ users)'] }] },

    { id:'db_schema',       category:'Architecture', origin:['ChatGPT','Claude','Codex'],
      name:'Database Schema Designer', icon:'🗂️',
      desc:'Design normalized database schemas with ER diagrams.',
      prompt:`You are a database architect. Design a {{type}} database schema for: {{domain}}. Include: entity definitions, relationships, primary/foreign keys, indexes, constraints, normalization form, and migration SQL. Draw an ASCII ER diagram. Consider: query patterns, write/read ratio, and data volume.`,
      params:[{ key:'type', label:'Database type', type:'select', options:['PostgreSQL (relational)','MongoDB (document)','DynamoDB (key-value)','Neo4j (graph)','Redis (cache/KV)','Time-series (InfluxDB)'] },{ key:'domain', label:'Domain / use case', type:'text', placeholder:'e.g. SaaS subscription app, IoT sensor data' }] },

    { id:'adr',             category:'Architecture', origin:['Claude','ChatGPT'],
      name:'ADR Writer', icon:'📋',
      desc:'Write Architecture Decision Records (ADRs) with context and consequences.',
      prompt:`Write a formal Architecture Decision Record (ADR) in Nygard format for: {{decision}}. Include: Title, Status, Context (technical and business), Decision, Consequences (positive, negative, neutral), Alternatives considered with pros/cons, and implementation notes. Be specific and objective.`,
      params:[{ key:'decision', label:'Decision to document', type:'text', placeholder:'e.g. Use PostgreSQL instead of MongoDB' }] },

    // ════════════════════════════════════════════
    //  WRITING & DOCUMENTATION
    // ════════════════════════════════════════════
    { id:'readme_gen',      category:'Docs',   origin:['ChatGPT','Claude','Copilot','Manus'],
      name:'README Generator', icon:'📝',
      desc:'Generate professional README files for any project.',
      prompt:`Generate a comprehensive, professional README.md for the described project. Include: badges, project overview, features list, quick start, installation, configuration, usage examples (with code), API reference (if applicable), contributing guide, and license. Make it engaging and developer-friendly. Format: {{format}}.`,
      params:[{ key:'format', label:'README style', type:'select', options:['Comprehensive (full)','Minimal (essentials)','Library/SDK style','CLI tool style','API service style'] }] },

    { id:'docstring_gen',   category:'Docs',   origin:['Copilot','Codex','ChatGPT','Claude'],
      name:'Docstring Generator', icon:'💬',
      desc:'Add docstrings and JSDoc comments to functions and classes.',
      prompt:`Add comprehensive documentation comments to the provided code. Style: {{style}}. Include for each function/class: purpose, parameters (with types and descriptions), return values, exceptions/errors thrown, examples, and any important notes. Do not change the code logic.`,
      params:[{ key:'style', label:'Doc style', type:'select', options:['JSDoc (JavaScript)','Google style (Python)','NumPy style (Python)','Sphinx (Python)','Javadoc','Rustdoc','TSDoc'] }] },

    { id:'tech_spec',       category:'Docs',   origin:['ChatGPT','Claude','Manus'],
      name:'Tech Spec Writer', icon:'📐',
      desc:'Write technical specifications and PRDs for features.',
      prompt:`Write a detailed technical specification for: {{feature}}. Include: Executive summary, Problem statement, Goals & non-goals, User stories, Technical requirements, Implementation approach, API contracts, Data model changes, Security considerations, Testing strategy, Rollout plan, Success metrics, and Open questions. Audience: {{audience}}.`,
      params:[{ key:'feature', label:'Feature/project name', type:'text', placeholder:'e.g. User authentication system' },{ key:'audience', label:'Audience', type:'select', options:['Engineering team','Cross-functional (eng + product + design)','Executive/stakeholders','External partners'] }] },

    { id:'changelog_gen',   category:'Docs',   origin:['ChatGPT','Claude'],
      name:'Changelog Generator', icon:'📋',
      desc:'Generate user-friendly changelogs from git commits or descriptions.',
      prompt:`Generate a well-formatted CHANGELOG.md entry for version {{version}}. Group changes into: Added, Changed, Deprecated, Removed, Fixed, Security. Write from the user's perspective — what does this mean for them? Keep it clear and non-technical where possible. Date: {{date}}.`,
      params:[{ key:'version', label:'Version', type:'text', placeholder:'1.2.0' },{ key:'date', label:'Release date', type:'text', placeholder:'2025-01-15' }] },

    // ════════════════════════════════════════════
    //  DEVOPS & INFRASTRUCTURE
    // ════════════════════════════════════════════
    { id:'ci_cd_gen',       category:'DevOps', origin:['ChatGPT','Claude','Manus','Copilot'],
      name:'CI/CD Pipeline Generator', icon:'🔄',
      desc:'Generate CI/CD pipelines for GitHub Actions, GitLab CI, Jenkins, etc.',
      prompt:`Generate a complete, production-ready CI/CD pipeline for {{platform}}. Stack: {{stack}}. Include: lint, test, build, security scan (SAST), Docker build, deployment stages (dev/staging/prod), secrets management, caching for fast builds, notifications, and rollback strategy. Follow security best practices.`,
      params:[{ key:'platform', label:'CI/CD platform', type:'select', options:['GitHub Actions','GitLab CI','Jenkins','CircleCI','Azure Pipelines','Bitbucket Pipelines','Travis CI','Drone CI'] },{ key:'stack', label:'Tech stack', type:'text', placeholder:'Node.js + Docker + Kubernetes' }] },

    { id:'k8s_gen',         category:'DevOps', origin:['ChatGPT','Claude','Manus'],
      name:'Kubernetes Config Generator', icon:'☸️',
      desc:'Generate Kubernetes manifests, Helm charts, and deployment configs.',
      prompt:`Generate production-ready Kubernetes manifests for {{app}}. Include: Deployment (with resources, probes, anti-affinity), Service, Ingress, ConfigMap, Secret (template), HorizontalPodAutoscaler, PodDisruptionBudget, NetworkPolicy, and ServiceAccount with RBAC. Replicas: {{replicas}}. Namespace: {{namespace}}.`,
      params:[{ key:'app', label:'Application name/description', type:'text', placeholder:'e.g. Node.js API service' },{ key:'replicas', label:'Replica count', type:'text', placeholder:'3' },{ key:'namespace', label:'Namespace', type:'text', placeholder:'production' }] },

    { id:'terraform_gen',   category:'DevOps', origin:['ChatGPT','Claude','Manus'],
      name:'Terraform Generator', icon:'🌍',
      desc:'Generate Terraform IaC for AWS, Azure, GCP.',
      prompt:`Generate production-ready Terraform code for {{resource}} on {{provider}}. Include: main.tf, variables.tf, outputs.tf, versions.tf. Use: modules where appropriate, remote state configuration, tagging strategy, security best practices, and comments explaining each resource. Environment: {{environment}}.`,
      params:[{ key:'resource', label:'What to provision', type:'text', placeholder:'e.g. EKS cluster, RDS + VPC' },{ key:'provider', label:'Cloud provider', type:'select', options:['AWS','Azure','GCP','DigitalOcean','Cloudflare','Multi-cloud'] },{ key:'environment', label:'Environment', type:'select', options:['Development','Staging','Production','All three (with workspaces)'] }] },

    // ════════════════════════════════════════════
    //  SECURITY
    // ════════════════════════════════════════════
    { id:'security_audit',  category:'Security', origin:['ChatGPT','Claude','Manus'],
      name:'Security Auditor', icon:'🔒',
      desc:'Audit code and configs for OWASP Top 10 and common vulnerabilities.',
      prompt:`Perform a comprehensive security audit of the provided code/configuration. Check for (at minimum): SQL injection, XSS, CSRF, authentication flaws, authorization issues, insecure deserialization, sensitive data exposure, security misconfiguration, using components with known vulnerabilities, and insufficient logging. For each finding: severity, CWE ID, evidence from the code, and remediation. Standard: {{standard}}.`,
      params:[{ key:'standard', label:'Security standard', type:'select', options:['OWASP Top 10','OWASP ASVS Level 1','OWASP ASVS Level 2','SOC 2','HIPAA','PCI-DSS','General best practices'] }] },

    { id:'threat_model',    category:'Security', origin:['Claude','ChatGPT'],
      name:'Threat Modeler', icon:'🛡️',
      desc:'STRIDE/PASTA threat modeling for systems and features.',
      prompt:`Perform a {{framework}} threat model for: {{system}}. For STRIDE: identify threats for each category (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege). For each threat: description, attack vector, likelihood (High/Medium/Low), impact, and mitigations. Include a trust boundary diagram in ASCII. Prioritize by risk.`,
      params:[{ key:'framework', label:'Threat model framework', type:'select', options:['STRIDE','PASTA','LINDDUN','CVSS scoring','Attack trees'] },{ key:'system', label:'System/feature to analyze', type:'text', placeholder:'e.g. User login and auth system' }] },

    // ════════════════════════════════════════════
    //  DATA & ANALYSIS
    // ════════════════════════════════════════════
    { id:'data_analysis',   category:'Data',   origin:['ChatGPT','Claude','Manus'],
      name:'Data Analyst', icon:'📊',
      desc:'Analyze data, find patterns, and generate insights with code.',
      prompt:`You are a data analyst. Analyze the described data/question. Provide: data exploration approach, statistical analysis, visualization recommendations (with code in {{library}}), key insights, anomalies detected, and actionable recommendations. Think like a data scientist: consider distributions, correlations, temporal patterns, and outliers.`,
      params:[{ key:'library', label:'Visualization library', type:'select', options:['Matplotlib/Seaborn','Plotly','D3.js','Chart.js','Vega-Lite','Recharts','Observable Plot'] }] },

    { id:'etl_gen',         category:'Data',   origin:['ChatGPT','Claude','Manus'],
      name:'ETL Pipeline Builder', icon:'🔀',
      desc:'Design and code ETL/ELT data pipelines.',
      prompt:`Design and implement an ETL pipeline to {{task}}. Technology: {{tech}}. Include: extraction logic, transformation steps (cleaning, validation, enrichment), loading strategy, error handling, logging, idempotency, and scheduling. Handle: schema changes, duplicate detection, and partial failure recovery.`,
      params:[{ key:'task', label:'ETL task', type:'text', placeholder:'e.g. sync Postgres to Snowflake, transform CSV to parquet' },{ key:'tech', label:'Tech stack', type:'select', options:['Python (pandas)','Python (dbt)','Apache Airflow','Spark','dlt (data load tool)','Node.js','SQL only'] }] },

    // ════════════════════════════════════════════
    //  WRITING & CONTENT
    // ════════════════════════════════════════════
    { id:'blog_post',       category:'Content', origin:['ChatGPT','Claude'],
      name:'Blog Post Writer', icon:'✍️',
      desc:'Write engaging technical or non-technical blog posts.',
      prompt:`Write a compelling {{length}} blog post about: {{topic}}. Audience: {{audience}}. Style: conversational yet authoritative, with concrete examples, analogies, and actionable takeaways. Include: attention-grabbing intro, clear sections with headers, code snippets where relevant, and a strong conclusion with next steps. SEO-optimize the title and headers.`,
      params:[{ key:'topic', label:'Topic', type:'text', placeholder:'e.g. Why we migrated from REST to GraphQL' },{ key:'audience', label:'Audience', type:'select', options:['Developers (technical)','Tech leaders/CTOs','General tech enthusiasts','Non-technical business readers'] },{ key:'length', label:'Length', type:'select', options:['Short (500 words)','Medium (1000 words)','Long (2000 words)','Deep dive (3000+ words)'] }] },

    { id:'email_writer',    category:'Content', origin:['ChatGPT','Claude'],
      name:'Email Composer', icon:'📧',
      desc:'Write professional emails, outreach, follow-ups, and announcements.',
      prompt:`Write a professional email for: {{purpose}}. Tone: {{tone}}. Keep it concise, clear, and with a specific call to action. Subject line: compelling and under 50 characters. Recipient: {{recipient}}.`,
      params:[{ key:'purpose', label:'Email purpose', type:'text', placeholder:'e.g. Announce new feature to customers, Follow up on job application' },{ key:'tone', label:'Tone', type:'select', options:['Professional','Friendly','Formal','Urgent','Apologetic','Celebratory'] },{ key:'recipient', label:'Recipient', type:'text', placeholder:'e.g. Team, Customers, Hiring manager, C-suite' }] },

    // ════════════════════════════════════════════
    //  AUTONOMOUS AGENT SKILLS
    // ════════════════════════════════════════════
    { id:'full_stack_build', category:'Agent',  origin:['Devin','Manus','ChatGPT','Claude'],
      name:'Full-Stack Builder', icon:'🚀',
      desc:'Build complete full-stack applications end-to-end autonomously.',
      prompt:`You are an expert full-stack developer. Build a complete, production-ready {{type}} application: {{spec}}. Stack: {{stack}}. Create ALL necessary files: frontend, backend, database schema, API routes, authentication, environment config, package.json/requirements.txt, Dockerfile, README, and .gitignore. Code must be real and runnable — no placeholders. Include basic tests.`,
      params:[{ key:'type', label:'App type', type:'select', options:['Web app (SPA)','REST API','Full-stack (frontend + API)','CLI tool','Mobile app (React Native)','Chrome extension','Discord bot','Telegram bot'] },{ key:'spec', label:'What to build', type:'text', placeholder:'e.g. Todo app with auth, Real-time chat, E-commerce store' },{ key:'stack', label:'Tech stack', type:'text', placeholder:'e.g. React + FastAPI + PostgreSQL' }] },

    { id:'migrate_codebase', category:'Agent',  origin:['Devin','Manus','Cursor'],
      name:'Codebase Migrator', icon:'🔄',
      desc:'Migrate codebases between frameworks, languages, or versions.',
      prompt:`You are a migration expert. Migrate the provided codebase {{from}} → {{to}}. Strategy: {{strategy}}. For each file: show the original (if provided), the migrated version, and explain the key changes. Identify: breaking changes, deprecated APIs replaced, new patterns used, and any manual steps required. Create a migration checklist.`,
      params:[{ key:'from', label:'Migrating from', type:'text', placeholder:'e.g. React 17, Python 2, CRA, Express' },{ key:'to', label:'Migrating to', type:'text', placeholder:'e.g. React 19, Python 3.12, Vite, Fastify' },{ key:'strategy', label:'Strategy', type:'select', options:['Big bang (all at once)','Incremental (file by file)','Parallel (run both)','Strangler fig pattern'] }] },

    { id:'perf_optimize',   category:'Agent',  origin:['ChatGPT','Claude','Copilot','Cursor'],
      name:'Performance Optimizer', icon:'⚡',
      desc:'Profile and optimize app performance — frontend, backend, and DB.',
      prompt:`You are a performance engineering expert. Analyze and optimize {{target}} for {{metric}}. Identify: bottlenecks, N+1 queries, unnecessary re-renders, missing indexes, inefficient algorithms, bundle size issues, and caching opportunities. For each optimization: before/after code, expected improvement, and how to measure it. Tool to use for profiling: {{tool}}.`,
      params:[{ key:'target', label:'What to optimize', type:'text', placeholder:'e.g. React app, API response time, Database queries' },{ key:'metric', label:'Key metric', type:'select', options:['Page load time','API latency (p99)','Database query time','Memory usage','CPU usage','Bundle size','Core Web Vitals'] },{ key:'tool', label:'Profiling tool', type:'select', options:['Chrome DevTools','React DevTools Profiler','py-spy (Python)','pprof (Go)','async-profiler (Java)','node --prof','EXPLAIN ANALYZE (SQL)','k6 (load testing)'] }] },

    { id:'accessibility',   category:'Agent',  origin:['ChatGPT','Claude'],
      name:'Accessibility Auditor', icon:'♿',
      desc:'Audit and fix WCAG 2.1 AA accessibility issues.',
      prompt:`Perform a comprehensive WCAG 2.1 AA accessibility audit of the provided UI code. Check: color contrast ratios, keyboard navigation, ARIA labels and roles, focus management, screen reader compatibility, alt text, form labels, error messages, and touch target sizes. For each issue: WCAG criterion violated, severity, and the exact code fix.`,
      params:[] },

    { id:'i18n',            category:'Agent',  origin:['ChatGPT','Claude','Copilot'],
      name:'Internationalization (i18n)', icon:'🌍',
      desc:'Add multilingual support to applications.',
      prompt:`Add {{framework}} internationalization to the provided code. Extract all user-facing strings, create translation files for {{languages}}, implement locale detection and switching, handle: pluralization, date/number/currency formatting, RTL languages if applicable, and lazy-loading of translations. Follow {{framework}} i18n best practices.`,
      params:[{ key:'framework', label:'i18n framework', type:'select', options:['react-i18next','next-intl','vue-i18n','Angular i18n','i18next (vanilla)','Python gettext','Flask-Babel','Rails i18n'] },{ key:'languages', label:'Target languages', type:'text', placeholder:'es, fr, de, ja, zh, ar (RTL)' }] },

    // ════════════════════════════════════════════
    //  RESEARCH & PLANNING
    // ════════════════════════════════════════════
    { id:'tech_comparison', category:'Research', origin:['ChatGPT','Claude','Manus'],
      name:'Tech Comparison', icon:'⚖️',
      desc:'Compare technologies, frameworks, and tools objectively.',
      prompt:`Provide an objective, comprehensive comparison of {{options}}. For each option: overview, strengths, weaknesses, ideal use cases, performance characteristics, community size, learning curve, cost, and future outlook. Create a decision matrix. Conclude with a recommendation based on {{criteria}}.`,
      params:[{ key:'options', label:'What to compare', type:'text', placeholder:'e.g. React vs Vue vs Svelte, PostgreSQL vs MongoDB' },{ key:'criteria', label:'Decision criteria', type:'text', placeholder:'e.g. small team, startup, performance critical, lots of relations' }] },

    { id:'learning_plan',   category:'Research', origin:['ChatGPT','Claude'],
      name:'Learning Plan Generator', icon:'🎓',
      desc:'Create structured learning paths for any technology.',
      prompt:`Create a comprehensive learning plan for: {{topic}}. Learner level: {{level}}. Time available: {{time}}. Include: week-by-week curriculum, best resources (free + paid), hands-on projects for each stage, milestones and checkpoints, common pitfalls to avoid, and how to know when you've mastered each topic. Format as an actionable roadmap.`,
      params:[{ key:'topic', label:'What to learn', type:'text', placeholder:'e.g. Machine learning, Kubernetes, Rust, System design' },{ key:'level', label:'Starting level', type:'select', options:['Complete beginner','Some programming experience','Experienced dev (new topic)','Expert deepening knowledge'] },{ key:'time', label:'Time commitment', type:'select', options:['1 hour/day','2-3 hours/day','Full-time (8hrs/day)','Weekend warrior'] }] },

    { id:'interview_prep',  category:'Research', origin:['ChatGPT','Claude'],
      name:'Interview Prep', icon:'💼',
      desc:'Generate and answer technical interview questions.',
      prompt:`You are a {{role}} interviewer at a top tech company. Generate {{count}} realistic interview questions for {{topic}}. For each question: the question itself, what it's testing, a model answer (with code where applicable), common mistakes candidates make, and follow-up questions. Difficulty: {{difficulty}}.`,
      params:[{ key:'role', label:'Role interviewing for', type:'text', placeholder:'e.g. Senior Frontend Engineer, ML Engineer, SRE' },{ key:'topic', label:'Topic area', type:'text', placeholder:'e.g. System design, React, Algorithms, Behavioral' },{ key:'count', label:'Number of questions', type:'select', options:['5','10','20'] },{ key:'difficulty', label:'Difficulty', type:'select', options:['Entry-level','Mid-level','Senior','Staff/Principal'] }] },
  ];

  // Enabled skills set
  let enabled = new Set();

  async function init() {
    const cfg = await nexus.getConfig();
    enabled = new Set(cfg.enabledSkills || []);
  }

  async function enable(id) {
    enabled.add(id);
    const cfg = await nexus.getConfig();
    cfg.enabledSkills = [...enabled];
    await nexus.saveConfig(cfg);
  }

  async function disable(id) {
    enabled.delete(id);
    const cfg = await nexus.getConfig();
    cfg.enabledSkills = [...enabled];
    await nexus.saveConfig(cfg);
  }

  function isEnabled(id) { return enabled.has(id); }
  function getEnabled() { return CATALOG.filter(s => enabled.has(s.id)); }

  function getCategories() { return [...new Set(CATALOG.map(s=>s.category))]; }

  // Build the system prompt for a skill with filled params
  function buildPrompt(skillId, paramValues) {
    const skill = CATALOG.find(s=>s.id===skillId);
    if (!skill) return '';
    let prompt = skill.prompt;
    for (const [key, val] of Object.entries(paramValues||{})) {
      prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || '');
    }
    // Fill any remaining placeholders with defaults
    prompt = prompt.replace(/\{\{[^}]+\}\}/g, '');
    return prompt;
  }

  // ── Render skills browser ─────────────────────────────
  function render(container, filter='', catFilter='All') {
    if (!container) return;
    const q = filter.toLowerCase();
    const filtered = CATALOG.filter(s => {
      const matchQ   = !q || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      const matchCat = catFilter==='All' || s.category===catFilter;
      return matchQ && matchCat;
    });

    const cats = [...new Set(filtered.map(s=>s.category))];
    container.innerHTML = cats.map(cat => `
      <div class="skill-section">
        <div class="skill-cat">${cat}</div>
        <div class="skill-grid">
          ${filtered.filter(s=>s.category===cat).map(s=>`
            <div class="skill-card ${isEnabled(s.id)?'enabled':''}">
              <div class="skill-card-hdr">
                <span class="skill-icon">${s.icon}</span>
                <div>
                  <div class="skill-name">${s.name}</div>
                  <div class="skill-origin">${s.origin.join(' · ')}</div>
                </div>
                <div class="skill-toggle-wrap">
                  <label class="skill-toggle">
                    <input type="checkbox" ${isEnabled(s.id)?'checked':''} onchange="Skills.toggle('${s.id}',this.checked)">
                    <span class="skill-slider"></span>
                  </label>
                </div>
              </div>
              <div class="skill-desc">${s.desc}</div>
              <div class="skill-card-btns">
                <button class="btn btn-sec btn-sm" onclick="Skills.use('${s.id}')">Use Now</button>
                <button class="btn btn-sec btn-sm" onclick="Skills.preview('${s.id}')">Preview Prompt</button>
              </div>
            </div>`).join('')}
        </div>
      </div>`).join('');
  }

  async function toggle(id, on) {
    if (on) await enable(id); else await disable(id);
    window.toast?.(`Skill ${on?'enabled':'disabled'}: ${CATALOG.find(s=>s.id===id)?.name}`, 'ok');
  }

  function use(id) {
    const skill = CATALOG.find(s=>s.id===id);
    if (!skill) return;
    // Show param dialog then use in agent
    if (!skill.params?.length) {
      injectSkill(id, {});
      return;
    }
    showParamDialog(skill);
  }

  function showParamDialog(skill) {
    const modal = document.getElementById('conn-modal');
    const body  = document.getElementById('conn-modal-body');
    if (!modal || !body) return;
    body.innerHTML = `
      <div style="margin-bottom:14px">
        <div style="font-size:15px;font-weight:700;margin-bottom:4px">${skill.icon} ${skill.name}</div>
        <div style="font-size:12px;color:var(--text2)">${skill.desc}</div>
      </div>
      ${skill.params.map(p=>`
        <div style="margin-bottom:10px">
          <label style="font-size:12px;color:var(--text1);display:block;margin-bottom:4px">${p.label}</label>
          ${p.type==='select'
            ? `<select id="sp-${p.key}" class="ssel">${(p.options||[]).map(o=>`<option>${o}</option>`).join('')}</select>`
            : `<input id="sp-${p.key}" class="sinp" type="text" placeholder="${p.placeholder||p.label}">`}
        </div>`).join('')}
      <div style="display:flex;gap:7px;margin-top:14px">
        <button class="btn btn-pri" onclick="Skills._useWithParams('${skill.id}')">▶ Use Skill</button>
        <button class="btn btn-sec" onclick="document.getElementById('conn-modal').classList.remove('open')">Cancel</button>
      </div>`;
    modal.classList.add('open');
  }

  function _useWithParams(id) {
    const skill = CATALOG.find(s=>s.id===id);
    const values = {};
    (skill?.params||[]).forEach(p=>{
      const el=document.getElementById(`sp-${p.key}`);
      if (el) values[p.key]=el.value;
    });
    document.getElementById('conn-modal')?.classList.remove('open');
    injectSkill(id, values);
  }

  function injectSkill(id, paramValues) {
    const skill = CATALOG.find(s=>s.id===id);
    if (!skill) return;
    const prompt = buildPrompt(id, paramValues);
    // Switch to agent view and pre-fill system context
    document.querySelector('[data-v="agent"]')?.click();
    const ctxEl = document.getElementById('ctx-ta');
    if (ctxEl) {
      ctxEl.value = `[SKILL ACTIVE: ${skill.name}]\n${prompt}`;
      window.S && (window.S.ctx = ctxEl.value);
    }
    window.toast?.(`✅ Skill loaded: ${skill.name}. Start chatting!`, 'ok');
  }

  function preview(id) {
    const skill = CATALOG.find(s=>s.id===id);
    if (!skill) return;
    const modal = document.getElementById('conn-modal');
    const body  = document.getElementById('conn-modal-body');
    if (!modal || !body) return;
    body.innerHTML = `
      <div style="font-size:14px;font-weight:700;margin-bottom:8px">${skill.icon} ${skill.name} — System Prompt</div>
      <div style="font-size:11px;color:var(--text2);margin-bottom:8px">Origin: ${skill.origin.join(', ')}</div>
      <pre style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:12px;font-size:11px;overflow:auto;max-height:300px;white-space:pre-wrap;color:var(--text1)">${esc(skill.prompt)}</pre>
      <button class="btn btn-sec" style="margin-top:10px" onclick="document.getElementById('conn-modal').classList.remove('open')">Close</button>`;
    modal.classList.add('open');
  }

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  return { CATALOG, init, enable, disable, isEnabled, getEnabled, getCategories, buildPrompt, render, toggle, use, preview, showParamDialog, _useWithParams };
})();
