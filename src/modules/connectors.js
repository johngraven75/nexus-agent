/* ═══════════════════════════════════════════════════════
   NEXUS AGENT — Connectors Catalog
   All major platform integrations with OAuth/API config
═══════════════════════════════════════════════════════ */

window.Connectors = (() => {

  const CATALOG = [
    // ── Dev / Code ───────────────────────────────────
    { id:'github',       category:'Dev',      name:'GitHub',           icon:'🐙', auth:'oauth2', provider:'github',    desc:'Repos, Issues, PRs, Actions, Gists', color:'#238636',
      scopes:['repo','read:user','read:org'], oauthUrl:'https://github.com/login/oauth/authorize',
      features:['Read/write repos','Create/close issues','Manage PRs','Trigger Actions','Browse Gists'],
      apiBase:'https://api.github.com',
      methods: { listRepos: (t)=>hGet('https://api.github.com/user/repos?per_page=50',t), listIssues:(t,r)=>hGet(`https://api.github.com/repos/${r}/issues`,t), createIssue:(t,r,b)=>hPost(`https://api.github.com/repos/${r}/issues`,b,t), createRepo:(t,b)=>hPost('https://api.github.com/user/repos',b,t) } },
    { id:'gitlab',       category:'Dev',      name:'GitLab',           icon:'🦊', auth:'token',  desc:'Repos, MRs, CI/CD pipelines', color:'#FC6D26',
      fields:[{ key:'url', label:'GitLab URL', placeholder:'https://gitlab.com' },{ key:'token', label:'Personal Access Token', type:'password' }] },
    { id:'bitbucket',    category:'Dev',      name:'Bitbucket',        icon:'🪣', auth:'oauth2', provider:'bitbucket', desc:'Repos, PRs, Pipelines', color:'#0052CC' },
    { id:'azure_devops', category:'Dev',      name:'Azure DevOps',     icon:'☁️', auth:'token',  desc:'Repos, Boards, Pipelines, Artifacts', color:'#0078D4',
      fields:[{ key:'org', label:'Organization' },{ key:'token', label:'PAT Token', type:'password' }] },
    { id:'jira',         category:'Dev',      name:'Jira',             icon:'🔷', auth:'oauth2', provider:'atlassian', desc:'Issues, Sprints, Boards, Epics', color:'#0052CC' },
    { id:'linear',       category:'Dev',      name:'Linear',           icon:'🔺', auth:'oauth2', provider:'linear',   desc:'Issues, Projects, Cycles, Roadmaps', color:'#5E6AD2' },
    { id:'vercel',       category:'Dev',      name:'Vercel',           icon:'▲',  auth:'token',  desc:'Deploy, Preview, Domains, Analytics', color:'#000',
      fields:[{ key:'token', label:'Vercel Token', type:'password' }] },
    { id:'netlify',      category:'Dev',      name:'Netlify',          icon:'🟢', auth:'token',  desc:'Sites, Deploys, Forms, Functions', color:'#00C7B7',
      fields:[{ key:'token', label:'Netlify Token', type:'password' }] },
    { id:'railway',      category:'Dev',      name:'Railway',          icon:'🚂', auth:'token',  desc:'Projects, Services, Deployments', color:'#B020FF',
      fields:[{ key:'token', label:'Railway Token', type:'password' }] },
    { id:'render',       category:'Dev',      name:'Render',           icon:'🌐', auth:'token',  desc:'Web Services, Databases, Cron Jobs', color:'#46E3B7',
      fields:[{ key:'token', label:'Render API Key', type:'password' }] },
    { id:'heroku',       category:'Dev',      name:'Heroku',           icon:'💜', auth:'token',  desc:'Apps, Dynos, Add-ons', color:'#6762A6',
      fields:[{ key:'token', label:'Heroku API Key', type:'password' }] },
    { id:'supabase',     category:'Dev',      name:'Supabase',         icon:'⚡', auth:'token',  desc:'Database, Auth, Storage, Edge Functions', color:'#3ECF8E',
      fields:[{ key:'url', label:'Project URL' },{ key:'key', label:'Service Role Key', type:'password' }] },
    { id:'planetscale',  category:'Dev',      name:'PlanetScale',      icon:'🪐', auth:'token',  desc:'MySQL-compatible serverless DB', color:'#fff',
      fields:[{ key:'token', label:'API Token', type:'password' }] },
    { id:'neon',         category:'Dev',      name:'Neon',             icon:'🧪', auth:'token',  desc:'Serverless Postgres', color:'#00E599',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    { id:'docker_hub',   category:'Dev',      name:'Docker Hub',       icon:'🐳', auth:'token',  desc:'Images, Repos, Builds', color:'#2496ED',
      fields:[{ key:'username', label:'Username' },{ key:'token', label:'Access Token', type:'password' }] },
    { id:'npm',          category:'Dev',      name:'npm Registry',     icon:'📦', auth:'token',  desc:'Publish, manage packages', color:'#CB3837',
      fields:[{ key:'token', label:'npm Token', type:'password' }] },
    { id:'sentry',       category:'Dev',      name:'Sentry',           icon:'🪲', auth:'token',  desc:'Error tracking, Performance', color:'#362D59',
      fields:[{ key:'token', label:'Auth Token', type:'password' },{ key:'org', label:'Organization slug' }] },
    { id:'datadog',      category:'Dev',      name:'Datadog',          icon:'📊', auth:'token',  desc:'Metrics, Logs, APM, Dashboards', color:'#632CA6',
      fields:[{ key:'apiKey', label:'API Key', type:'password' },{ key:'appKey', label:'App Key', type:'password' }] },
    // ── Cloud ────────────────────────────────────────
    { id:'aws',          category:'Cloud',    name:'AWS',              icon:'☁️', auth:'keys',   desc:'S3, EC2, Lambda, RDS, CloudFormation…', color:'#FF9900',
      fields:[{ key:'accessKey', label:'Access Key ID' },{ key:'secretKey', label:'Secret Access Key', type:'password' },{ key:'region', label:'Default Region', placeholder:'us-east-1' }] },
    { id:'azure',        category:'Cloud',    name:'Microsoft Azure',  icon:'🟦', auth:'oauth2', provider:'microsoft', desc:'VMs, Storage, Functions, Cosmos DB', color:'#0078D4' },
    { id:'gcp',          category:'Cloud',    name:'Google Cloud',     icon:'🟡', auth:'oauth2', provider:'google',   desc:'Compute, Storage, BigQuery, Cloud Run', color:'#4285F4' },
    { id:'cloudflare',   category:'Cloud',    name:'Cloudflare',       icon:'🟠', auth:'token',  desc:'DNS, Pages, Workers, R2, D1', color:'#F48120',
      fields:[{ key:'apiToken', label:'API Token', type:'password' },{ key:'accountId', label:'Account ID' }] },
    { id:'digitalocean', category:'Cloud',    name:'DigitalOcean',     icon:'🌊', auth:'token',  desc:'Droplets, Apps, Databases, Spaces', color:'#0080FF',
      fields:[{ key:'token', label:'Personal Access Token', type:'password' }] },
    // ── Productivity ─────────────────────────────────
    { id:'notion',       category:'Productivity', name:'Notion',       icon:'⬜', auth:'oauth2', provider:'notion',   desc:'Pages, Databases, Blocks, Comments', color:'#fff' },
    { id:'airtable',     category:'Productivity', name:'Airtable',     icon:'🟦', auth:'token',  desc:'Bases, Tables, Records, Automations', color:'#17BEBB',
      fields:[{ key:'token', label:'Personal Access Token', type:'password' }] },
    { id:'coda',         category:'Productivity', name:'Coda',         icon:'📓', auth:'token',  desc:'Docs, Tables, Formulas, Automations', color:'#DE5034',
      fields:[{ key:'token', label:'API Token', type:'password' }] },
    { id:'obsidian',     category:'Productivity', name:'Obsidian',     icon:'💎', auth:'local',  desc:'Local vault notes (via Local REST API)', color:'#7C3AED',
      fields:[{ key:'port', label:'REST API Port', placeholder:'27123' }] },
    // ── Communication ────────────────────────────────
    { id:'slack',        category:'Communication', name:'Slack',       icon:'💬', auth:'oauth2', provider:'slack',    desc:'Messages, Channels, Files, Workflows', color:'#4A154B' },
    { id:'discord',      category:'Communication', name:'Discord',     icon:'🎮', auth:'token',  desc:'Messages, Channels, Roles, Webhooks', color:'#5865F2',
      fields:[{ key:'token', label:'Bot Token', type:'password' }] },
    { id:'teams',        category:'Communication', name:'Microsoft Teams', icon:'🟣', auth:'oauth2', provider:'microsoft', desc:'Messages, Channels, Meetings, Files', color:'#6264A7' },
    { id:'gmail',        category:'Communication', name:'Gmail',       icon:'📧', auth:'oauth2', provider:'google',   desc:'Read, send, search, label emails', color:'#EA4335' },
    { id:'outlook',      category:'Communication', name:'Outlook',     icon:'📨', auth:'oauth2', provider:'microsoft', desc:'Email, Calendar, Contacts', color:'#0078D4' },
    { id:'sendgrid',     category:'Communication', name:'SendGrid',    icon:'📮', auth:'token',  desc:'Transactional email, Templates', color:'#1A82E2',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    { id:'twilio',       category:'Communication', name:'Twilio',      icon:'📱', auth:'keys',   desc:'SMS, Voice, WhatsApp, Email', color:'#F22F46',
      fields:[{ key:'accountSid', label:'Account SID' },{ key:'authToken', label:'Auth Token', type:'password' }] },
    // ── Data / Analytics ─────────────────────────────
    { id:'google_sheets',category:'Data',     name:'Google Sheets',    icon:'📊', auth:'oauth2', provider:'google',   desc:'Read/write spreadsheets, formulas', color:'#34A853' },
    { id:'google_drive', category:'Data',     name:'Google Drive',     icon:'🗂️', auth:'oauth2', provider:'google',   desc:'Files, Folders, Docs, Slides', color:'#4285F4' },
    { id:'google_docs',  category:'Data',     name:'Google Docs',      icon:'📝', auth:'oauth2', provider:'google',   desc:'Create, edit, export documents', color:'#4285F4' },
    { id:'onedrive',     category:'Data',     name:'OneDrive',         icon:'☁️', auth:'oauth2', provider:'microsoft', desc:'Files, Folders, SharePoint', color:'#0078D4' },
    { id:'dropbox',      category:'Data',     name:'Dropbox',          icon:'📦', auth:'oauth2', provider:'dropbox',  desc:'Files, Sharing, Backups', color:'#0061FF' },
    { id:'snowflake',    category:'Data',     name:'Snowflake',        icon:'❄️', auth:'keys',   desc:'Queries, Databases, Warehouses', color:'#29B5E8',
      fields:[{ key:'account', label:'Account Identifier' },{ key:'user', label:'Username' },{ key:'password', label:'Password', type:'password' },{ key:'database', label:'Database' },{ key:'warehouse', label:'Warehouse' }] },
    { id:'bigquery',     category:'Data',     name:'Google BigQuery',  icon:'🔍', auth:'oauth2', provider:'google',   desc:'SQL queries, Datasets, Tables', color:'#4285F4' },
    { id:'stripe',       category:'Data',     name:'Stripe',           icon:'💳', auth:'token',  desc:'Payments, Subscriptions, Customers', color:'#635BFF',
      fields:[{ key:'secretKey', label:'Secret Key', type:'password' }] },
    // ── CRM / Business ───────────────────────────────
    { id:'hubspot',      category:'CRM',      name:'HubSpot',          icon:'🔶', auth:'oauth2', provider:'hubspot',  desc:'Contacts, Deals, Marketing, CMS', color:'#FF7A59' },
    { id:'salesforce',   category:'CRM',      name:'Salesforce',       icon:'☁️', auth:'oauth2', provider:'salesforce', desc:'CRM, Leads, Opportunities, Analytics', color:'#00A1E0' },
    { id:'pipedrive',    category:'CRM',      name:'Pipedrive',        icon:'🟢', auth:'token',  desc:'Deals, Contacts, Activities, Pipeline', color:'#00945D',
      fields:[{ key:'apiToken', label:'API Token', type:'password' }] },
    { id:'zendesk',      category:'CRM',      name:'Zendesk',          icon:'🎫', auth:'token',  desc:'Tickets, Users, Organizations, Help Center', color:'#03363D',
      fields:[{ key:'subdomain', label:'Subdomain', placeholder:'yourco' },{ key:'email', label:'Email' },{ key:'token', label:'API Token', type:'password' }] },
    { id:'intercom',     category:'CRM',      name:'Intercom',         icon:'💬', auth:'token',  desc:'Conversations, Users, Companies, Inbox', color:'#0057FF',
      fields:[{ key:'token', label:'Access Token', type:'password' }] },
    // ── Project Management ───────────────────────────
    { id:'asana',        category:'PM',       name:'Asana',            icon:'🟣', auth:'oauth2', provider:'asana',    desc:'Tasks, Projects, Teams, Portfolios', color:'#FC636B' },
    { id:'trello',       category:'PM',       name:'Trello',           icon:'🟦', auth:'oauth2', provider:'trello',   desc:'Boards, Cards, Lists, Checklists', color:'#0052CC' },
    { id:'monday',       category:'PM',       name:'Monday.com',       icon:'🔴', auth:'token',  desc:'Boards, Items, Columns, Automations', color:'#FF3D57',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    { id:'clickup',      category:'PM',       name:'ClickUp',          icon:'🟣', auth:'token',  desc:'Tasks, Spaces, Lists, Goals', color:'#7B68EE',
      fields:[{ key:'apiKey', label:'Personal API Token', type:'password' }] },
    { id:'basecamp',     category:'PM',       name:'Basecamp',         icon:'🏕️', auth:'oauth2', provider:'basecamp', desc:'Projects, To-dos, Messages, Schedules', color:'#1D2D35' },
    // ── AI / ML platforms ────────────────────────────
    { id:'replicate',    category:'AI',       name:'Replicate',        icon:'🤖', auth:'token',  desc:'Run AI models (image, video, audio, text)', color:'#000',
      fields:[{ key:'token', label:'API Token', type:'password' }] },
    { id:'fal',          category:'AI',       name:'fal.ai',           icon:'⚡', auth:'token',  desc:'Fast image/video AI models', color:'#6600FF',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    { id:'elevenlabs',   category:'AI',       name:'ElevenLabs',       icon:'🎙️', auth:'token',  desc:'TTS, Voice cloning, Sound effects', color:'#000',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    { id:'deepgram',     category:'AI',       name:'Deepgram',         icon:'🎤', auth:'token',  desc:'Speech-to-text, Transcription', color:'#00BFD8',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    { id:'cohere',       category:'AI',       name:'Cohere',           icon:'🟢', auth:'token',  desc:'Embeddings, Rerank, Command models', color:'#39594D',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    { id:'pinecone',     category:'AI',       name:'Pinecone',         icon:'🌲', auth:'token',  desc:'Vector database, Semantic search', color:'#1B263B',
      fields:[{ key:'apiKey', label:'API Key', type:'password' },{ key:'environment', label:'Environment' }] },
    { id:'weaviate',     category:'AI',       name:'Weaviate',         icon:'🧩', auth:'token',  desc:'Vector DB, GraphQL search', color:'#00D0A1',
      fields:[{ key:'url', label:'Weaviate URL' },{ key:'apiKey', label:'API Key (optional)', type:'password' }] },
    { id:'langsmith',    category:'AI',       name:'LangSmith',        icon:'🦜', auth:'token',  desc:'LLM tracing, evaluation, datasets', color:'#1C1C1C',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    { id:'weights_biases',category:'AI',      name:'Weights & Biases', icon:'📈', auth:'token',  desc:'Experiment tracking, Model registry', color:'#FFBE00',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    // ── Social / Content ─────────────────────────────
    { id:'twitter_x',    category:'Social',   name:'X (Twitter)',      icon:'🐦', auth:'oauth2', provider:'twitter',  desc:'Tweets, DMs, Search, Analytics', color:'#000' },
    { id:'linkedin',     category:'Social',   name:'LinkedIn',         icon:'💼', auth:'oauth2', provider:'linkedin', desc:'Posts, Profile, Company, Jobs', color:'#0A66C2' },
    { id:'youtube',      category:'Social',   name:'YouTube',          icon:'▶️', auth:'oauth2', provider:'google',   desc:'Videos, Playlists, Analytics, Captions', color:'#FF0000' },
    { id:'wordpress',    category:'Social',   name:'WordPress',        icon:'🟦', auth:'token',  desc:'Posts, Pages, Media, Comments', color:'#21759B',
      fields:[{ key:'siteUrl', label:'Site URL' },{ key:'username', label:'Username' },{ key:'appPassword', label:'App Password', type:'password' }] },
    { id:'shopify',      category:'Social',   name:'Shopify',          icon:'🛍️', auth:'token',  desc:'Products, Orders, Customers, Analytics', color:'#96BF48',
      fields:[{ key:'shop', label:'Shop name (.myshopify.com)' },{ key:'apiKey', label:'Admin API Token', type:'password' }] },
    // ── Finance ──────────────────────────────────────
    { id:'plaid',        category:'Finance',  name:'Plaid',            icon:'🏦', auth:'token',  desc:'Bank accounts, Transactions, Balance', color:'#00B0E6',
      fields:[{ key:'clientId', label:'Client ID' },{ key:'secret', label:'Secret', type:'password' },{ key:'env', label:'Environment', placeholder:'sandbox' }] },
    { id:'quickbooks',   category:'Finance',  name:'QuickBooks',       icon:'💚', auth:'oauth2', provider:'intuit',   desc:'Invoices, Expenses, Reports, Payroll', color:'#2CA01C' },
    // ── Monitoring / Ops ─────────────────────────────
    { id:'pagerduty',    category:'Ops',      name:'PagerDuty',        icon:'🔔', auth:'token',  desc:'Incidents, Alerts, On-call schedules', color:'#06AC38',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    { id:'grafana',      category:'Ops',      name:'Grafana',          icon:'📈', auth:'token',  desc:'Dashboards, Alerts, Data sources', color:'#F46800',
      fields:[{ key:'url', label:'Grafana URL' },{ key:'token', label:'Service Account Token', type:'password' }] },
    { id:'new_relic',    category:'Ops',      name:'New Relic',        icon:'🟢', auth:'token',  desc:'APM, Infrastructure, Logs, Alerts', color:'#1CE783',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    // ── Calendar / Scheduling ────────────────────────
    { id:'gcal',         category:'Calendar', name:'Google Calendar',  icon:'📅', auth:'oauth2', provider:'google',   desc:'Events, Calendars, Availability', color:'#4285F4' },
    { id:'cal_com',      category:'Calendar', name:'Cal.com',          icon:'📆', auth:'token',  desc:'Scheduling, Bookings, Event Types', color:'#292929',
      fields:[{ key:'apiKey', label:'API Key', type:'password' }] },
    { id:'calendly',     category:'Calendar', name:'Calendly',         icon:'🗓️', auth:'oauth2', provider:'calendly', desc:'Scheduling, Invitees, Event Types', color:'#006BFF' },
  ];

  // Group by category
  const CATEGORIES = [...new Set(CATALOG.map(c=>c.category))];

  // Connected state (loaded from config)
  let connected = {};
  let savedTokens = {};

  async function init() {
    const cfg = await nexus.getConfig();
    connected  = cfg.connectors || {};
    savedTokens = cfg.connectorTokens || {};
  }

  async function save() {
    const cfg = await nexus.getConfig();
    cfg.connectors = connected;
    cfg.connectorTokens = savedTokens;
    await nexus.saveConfig(cfg);
  }

  function isConnected(id) { return !!connected[id]; }
  function getToken(id, field) { return (savedTokens[id]||{})[field] || ''; }

  async function connect(id, fields) {
    connected[id] = { connectedAt: Date.now(), fields };
    savedTokens[id] = fields;
    await save();
  }

  async function disconnect(id) {
    delete connected[id];
    delete savedTokens[id];
    await save();
  }

  // ── OAuth flow ───────────────────────────────────────
  const OAUTH_URLS = {
    github:      { authUrl:'https://github.com/login/oauth/authorize',   clientId: '' },
    google:      { authUrl:'https://accounts.google.com/o/oauth2/v2/auth', clientId: '' },
    microsoft:   { authUrl:'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', clientId: '' },
    slack:       { authUrl:'https://slack.com/oauth/v2/authorize',       clientId: '' },
    notion:      { authUrl:'https://api.notion.com/v1/oauth/authorize',  clientId: '' },
    atlassian:   { authUrl:'https://auth.atlassian.com/authorize',       clientId: '' },
    linear:      { authUrl:'https://linear.app/oauth/authorize',         clientId: '' },
  };

  function startOAuth(connectorId, provider) {
    // Show modal with instructions since we can't do server-side OAuth here
    showOAuthInstructions(connectorId, provider);
  }

  function showOAuthInstructions(connectorId, provider) {
    const conn = CATALOG.find(c=>c.id===connectorId);
    const modal = document.getElementById('conn-modal');
    const body  = document.getElementById('conn-modal-body');
    if (!modal || !body) return;
    body.innerHTML = `
      <div style="margin-bottom:12px">
        <div style="font-size:14px;font-weight:700;margin-bottom:6px">${conn?.icon} Connect ${conn?.name}</div>
        <div style="font-size:12px;color:var(--text2);margin-bottom:12px">${conn?.desc}</div>
      </div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:12px;margin-bottom:14px;font-size:12px;color:var(--text2);line-height:1.7">
        <b style="color:var(--yellow)">⚠️ OAuth Notice</b><br>
        Full OAuth requires a server redirect URI. To connect ${conn?.name}:<br>
        1. Create an app/token at <b>${conn?.name}</b>'s developer portal<br>
        2. Generate a Personal Access Token or API Key<br>
        3. Paste it in the field below
      </div>
      ${buildFieldsForm(connectorId)}
      <div style="display:flex;gap:7px;margin-top:14px">
        <button class="btn btn-pri" onclick="Connectors.saveManualToken('${connectorId}')">✓ Connect</button>
        <button class="btn btn-sec" onclick="document.getElementById('conn-modal').classList.remove('open')">Cancel</button>
        ${getPortalLink(connectorId)}
      </div>`;
    modal.classList.add('open');
  }

  function getPortalLink(id) {
    const portals = {
      github:'https://github.com/settings/tokens', gitlab:'https://gitlab.com/-/profile/personal_access_tokens',
      vercel:'https://vercel.com/account/tokens', netlify:'https://app.netlify.com/user/applications',
      azure_devops:'https://dev.azure.com', airtable:'https://airtable.com/create/tokens',
      notion:'https://www.notion.so/my-integrations', slack:'https://api.slack.com/apps',
      discord:'https://discord.com/developers/applications', stripe:'https://dashboard.stripe.com/apikeys',
      shopify:'https://partners.shopify.com', openai:'https://platform.openai.com/api-keys',
      aws:'https://console.aws.amazon.com/iam', cloudflare:'https://dash.cloudflare.com/profile/api-tokens',
      supabase:'https://supabase.com/dashboard', pinecone:'https://app.pinecone.io', replicate:'https://replicate.com/account/api-tokens',
      elevenlabs:'https://elevenlabs.io/app/settings/api-keys', datadog:'https://app.datadoghq.com/organization-settings/api-keys',
    };
    const url = portals[id];
    return url ? `<a href="${url}" target="_blank" class="btn btn-sec" style="text-decoration:none">🔗 Open Developer Portal</a>` : '';
  }

  function buildFieldsForm(connectorId) {
    const conn = CATALOG.find(c=>c.id===connectorId);
    const fields = conn?.fields || [{ key:'token', label:'API Token / Key', type:'password' }];
    return fields.map(f=>`
      <div style="margin-bottom:10px">
        <label style="font-size:12px;color:var(--text1);display:block;margin-bottom:4px">${f.label}</label>
        <input id="cf-${connectorId}-${f.key}" type="${f.type||'text'}" class="sinp" placeholder="${f.placeholder||''}" value="${getToken(connectorId, f.key)||''}">
      </div>`).join('');
  }

  async function saveManualToken(connectorId) {
    const conn = CATALOG.find(c=>c.id===connectorId);
    const fields = conn?.fields || [{ key:'token', label:'API Token', type:'password' }];
    const values = {};
    let hasValue = false;
    for (const f of fields) {
      const el = document.getElementById(`cf-${connectorId}-${f.key}`);
      if (el?.value) { values[f.key]=el.value; hasValue=true; }
    }
    if (!hasValue) { window.toast?.('Please enter at least one field','er'); return; }
    await connect(connectorId, values);
    document.getElementById('conn-modal')?.classList.remove('open');
    renderCatalog(document.getElementById('connectors-grid'));
    window.toast?.(`✅ ${conn?.name} connected`,'ok');
  }

  // ── HTTP helpers ─────────────────────────────────────
  async function hGet(url, token) {
    const r = await nexus.httpRequest({ method:'GET', url, headers:{ 'Authorization':`token ${token}`, 'Accept':'application/vnd.github.v3+json' } });
    return r.data;
  }
  async function hPost(url, body, token) {
    const r = await nexus.httpRequest({ method:'POST', url, headers:{ 'Authorization':`token ${token}`, 'Content-Type':'application/json', 'Accept':'application/vnd.github.v3+json' }, body });
    return r.data;
  }

  // ── Execute connector action via AI agent ─────────────
  async function executeAction(connectorId, action, params) {
    const conn = CATALOG.find(c=>c.id===connectorId);
    const token = getToken(connectorId, 'token') || getToken(connectorId, 'apiKey') || getToken(connectorId, 'secretKey');
    if (conn?.methods?.[action]) return await conn.methods[action](token, ...Object.values(params||{}));
    return { error:`No direct implementation for ${connectorId}.${action}` };
  }

  // ── Render catalog ────────────────────────────────────
  function renderCatalog(container, filter='') {
    if (!container) return;
    const q = filter.toLowerCase();
    const filtered = CATALOG.filter(c => !q || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    const byCategory = {};
    for (const c of filtered) { if (!byCategory[c.category]) byCategory[c.category]=[];  byCategory[c.category].push(c); }
    container.innerHTML = Object.entries(byCategory).map(([cat, items])=>`
      <div class="conn-section">
        <div class="conn-cat-label">${cat}</div>
        <div class="conn-grid">
          ${items.map(c=>`
            <div class="conn-card ${isConnected(c.id)?'connected':''}">
              <div class="conn-card-top">
                <span class="conn-icon">${c.icon}</span>
                <div class="conn-name">${c.name}</div>
                ${isConnected(c.id)?'<span class="conn-status-badge">✓ Connected</span>':''}
              </div>
              <div class="conn-desc">${c.desc}</div>
              <div class="conn-card-btns">
                ${isConnected(c.id)
                  ? `<button class="btn btn-red btn-sm" onclick="Connectors.disconnect('${c.id}').then(()=>Connectors.renderCatalog(document.getElementById('connectors-grid')))">Disconnect</button>`
                  : `<button class="btn btn-pri btn-sm" onclick="Connectors.showConnect('${c.id}')">Connect</button>`}
              </div>
            </div>`).join('')}
        </div>
      </div>`).join('');
  }

  function showConnect(id) {
    showOAuthInstructions(id, CATALOG.find(c=>c.id===id)?.provider);
  }

  return { CATALOG, CATEGORIES, init, connect, disconnect, isConnected, getToken, saveManualToken, startOAuth, showConnect, renderCatalog, executeAction };
})();
