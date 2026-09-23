/* ═══════════════════════════════════════════════════════════════════════════
   NEXUS AGENT — Free Tier Manager v2
   Bootstraps with free providers at first launch.
   Covers: Text · Multimodal (vision) · Uncensored models
   Priority: OpenRouter → HuggingFace (serverless) → Ollama (local)
═══════════════════════════════════════════════════════════════════════════ */

window.FreeTier = (() => {

  // ══════════════════════════════════════════════════════════════════════════
  //  OPENROUTER FREE MODELS  (all :free suffix = zero cost, needs free acct)
  // ══════════════════════════════════════════════════════════════════════════
  const OR_FREE_MODELS = {

    // ── Text / General ──────────────────────────────────────────────────────
    text: [
      { id:'meta-llama/llama-3.1-8b-instruct:free',          name:'Llama 3.1 8B',                 ctx:131072, tags:['text','code','fast'],       note:'Best all-round free text model' },
      { id:'meta-llama/llama-3.2-3b-instruct:free',          name:'Llama 3.2 3B (fast)',           ctx:131072, tags:['text','fast'],              note:'Very fast, lower quality' },
      { id:'meta-llama/llama-3.2-1b-instruct:free',          name:'Llama 3.2 1B (tiny)',           ctx:131072, tags:['text','tiny'],              note:'Tiny and ultra fast' },
      { id:'google/gemma-2-9b-it:free',                      name:'Gemma 2 9B',                   ctx:8192,   tags:['text','reasoning'],         note:'Strong reasoning, Google' },
      { id:'mistralai/mistral-7b-instruct:free',             name:'Mistral 7B Instruct',           ctx:32768,  tags:['text','code'],              note:'Reliable code + chat' },
      { id:'qwen/qwen-2-7b-instruct:free',                   name:'Qwen 2 7B',                    ctx:131072, tags:['text','code','multilingual'],note:'Multilingual, huge context' },
      { id:'microsoft/phi-3-mini-128k-instruct:free',        name:'Phi-3 Mini 128K',              ctx:131072, tags:['text','code'],              note:'128K context, small+smart' },
      { id:'openchat/openchat-7b:free',                      name:'OpenChat 7B',                  ctx:8192,   tags:['text','chat'],              note:'Great chat, OpenAI-trained' },
      { id:'huggingfaceh4/zephyr-7b-beta:free',             name:'Zephyr 7B Beta',               ctx:32768,  tags:['text','instruction'],       note:'Instruction-tuned Mistral' },
      { id:'openrouter/auto',                                 name:'Auto (best free available)',   ctx:200000, tags:['text','auto'],              note:'OpenRouter picks best free model' },
    ],

    // ── Multimodal / Vision (image + text input) ────────────────────────────
    vision: [
      { id:'meta-llama/llama-3.2-11b-vision-instruct:free',  name:'Llama 3.2 11B Vision',         ctx:131072, tags:['vision','multimodal'],      note:'✅ Best free vision model — analyze images, screenshots, diagrams' },
      { id:'meta-llama/llama-3.2-90b-vision-instruct:free',  name:'Llama 3.2 90B Vision',         ctx:131072, tags:['vision','multimodal','large'],note:'✅ Largest free vision model — highest quality image understanding' },
      { id:'qwen/qwen-2-vl-7b-instruct:free',                name:'Qwen2-VL 7B Vision',           ctx:32768,  tags:['vision','multimodal'],      note:'✅ Strong OCR + document understanding' },
      { id:'google/gemma-3-12b-it:free',                     name:'Gemma 3 12B (multimodal)',     ctx:131072, tags:['vision','multimodal'],      note:'✅ Google multimodal, images + text' },
      { id:'mistralai/pixtral-12b:free',                     name:'Pixtral 12B Vision',           ctx:131072, tags:['vision','multimodal'],      note:'✅ Mistral vision model, great at charts/tables' },
      { id:'bytedance-research/ui-tars-72b:free',            name:'UI-TARS 72B (UI vision)',      ctx:32768,  tags:['vision','ui','agent'],      note:'✅ Specialized in UI screenshots + web automation' },
      { id:'moonshotai/moonlight-16b-a3b-instruct:free',    name:'Moonlight 16B',                ctx:32768,  tags:['vision','multimodal'],      note:'✅ MoE vision model from Moonshot AI' },
    ],

    // ── Uncensored / Unfiltered ─────────────────────────────────────────────
    uncensored: [
      { id:'nousresearch/hermes-3-llama-3.1-405b:free',      name:'Hermes 3 Llama 405B',          ctx:131072, tags:['uncensored','large','code'], note:'🔓 Best uncensored free model — Nous Research, Llama backbone, huge' },
      { id:'nousresearch/hermes-3-llama-3.1-70b:free',       name:'Hermes 3 Llama 70B',           ctx:131072, tags:['uncensored','code'],         note:'🔓 Uncensored Llama 70B, excellent reasoning' },
      { id:'nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free',name:'Nous Hermes 2 Mixtral DPO',  ctx:32768,  tags:['uncensored','fast'],         note:'🔓 MOE uncensored, very capable' },
      { id:'gryphe/mythomax-l2-13b:free',                    name:'MythoMax L2 13B',              ctx:4096,   tags:['uncensored','creative','roleplay'],note:'🔓 Creative writing, roleplay, uncensored' },
      { id:'gryphe/mythomist-7b:free',                       name:'MythoMist 7B',                 ctx:32768,  tags:['uncensored','creative'],     note:'🔓 Creative + uncensored, 32K context' },
      { id:'sao10k/l3-euryale-70b:free',                     name:'L3 Euryale 70B',               ctx:131072, tags:['uncensored','creative','large'],note:'🔓 Llama 3 uncensored, top creative writing' },
      { id:'undi95/remm-slerp-l2-13b:free',                  name:'REMM SLERP L2 13B',            ctx:4096,   tags:['uncensored'],               note:'🔓 Uncensored merged model' },
      { id:'neversleep/noromaid-20b:free',                   name:'Noromaid 20B',                 ctx:8192,   tags:['uncensored','roleplay'],     note:'🔓 Uncensored roleplay specialist' },
      { id:'alpindale/goliath-120b:free',                    name:'Goliath 120B',                 ctx:6144,   tags:['uncensored','large'],        note:'🔓 Huge uncensored merged model' },
      { id:'undi95/toppy-m-7b:free',                         name:'Toppy M 7B',                   ctx:4096,   tags:['uncensored','creative'],     note:'🔓 Creative uncensored 7B' },
    ],

    // ── Code-focused ────────────────────────────────────────────────────────
    code: [
      { id:'qwen/qwen-2.5-coder-7b-instruct:free',           name:'Qwen 2.5 Coder 7B',           ctx:131072, tags:['code','free'],              note:'✅ Best free code model, huge context' },
      { id:'qwen/qwen-2.5-coder-32b-instruct:free',          name:'Qwen 2.5 Coder 32B',          ctx:131072, tags:['code','large','free'],       note:'✅ Large free code model, top performance' },
      { id:'deepseek/deepseek-r1:free',                      name:'DeepSeek R1 (reasoning)',      ctx:164000, tags:['code','reasoning','free'],   note:'✅ Chain-of-thought reasoning, great for complex code' },
      { id:'deepseek/deepseek-r1-distill-llama-70b:free',   name:'DeepSeek R1 Distill 70B',     ctx:131072, tags:['code','reasoning'],         note:'✅ Distilled DeepSeek-R1 on Llama 70B' },
    ],
  };

  // Flat list of all OR free models for iteration
  const OR_FREE_ALL = [
    ...OR_FREE_MODELS.text,
    ...OR_FREE_MODELS.vision,
    ...OR_FREE_MODELS.uncensored,
    ...OR_FREE_MODELS.code,
  ];

  // ══════════════════════════════════════════════════════════════════════════
  //  HUGGINGFACE FREE SERVERLESS MODELS  (no key needed, public models)
  // ══════════════════════════════════════════════════════════════════════════
  const HF_FREE_MODELS = {

    // ── Text / General ──────────────────────────────────────────────────────
    text: [
      { id:'mistralai/Mistral-7B-Instruct-v0.3',        name:'Mistral 7B Instruct v0.3',  ctx:32768,  tags:['text','code'],        note:'Most reliable HF free model, great for code+chat' },
      { id:'HuggingFaceH4/zephyr-7b-beta',              name:'Zephyr 7B Beta',            ctx:32768,  tags:['text'],               note:'Instruction-tuned, reliable' },
      { id:'microsoft/Phi-3-mini-4k-instruct',          name:'Phi-3 Mini 4K',             ctx:4096,   tags:['text','small'],       note:'Small but smart, Microsoft' },
      { id:'Qwen/Qwen2.5-7B-Instruct',                  name:'Qwen 2.5 7B Instruct',      ctx:32768,  tags:['text','code'],        note:'Strong multilingual + code' },
      { id:'Qwen/Qwen2.5-72B-Instruct',                 name:'Qwen 2.5 72B Instruct',     ctx:32768,  tags:['text','code','large'],note:'Largest free HF text model' },
      { id:'google/gemma-2-2b-it',                      name:'Gemma 2 2B IT',             ctx:8192,   tags:['text','fast','small'],note:'Fast small model from Google' },
      { id:'google/gemma-2-9b-it',                      name:'Gemma 2 9B IT',             ctx:8192,   tags:['text'],               note:'Strong Google model' },
      { id:'meta-llama/Meta-Llama-3.1-8B-Instruct',    name:'Llama 3.1 8B Instruct',     ctx:131072, tags:['text','code'],        note:'Meta Llama (may need token)' },
      { id:'TinyLlama/TinyLlama-1.1B-Chat-v1.0',       name:'TinyLlama 1.1B',            ctx:2048,   tags:['text','tiny','fast'], note:'Tiny, instant inference' },
      { id:'microsoft/DialoGPT-large',                  name:'DialoGPT Large',            ctx:1024,   tags:['chat','fast'],        note:'Simple chat, always available' },
    ],

    // ── Multimodal / Vision ─────────────────────────────────────────────────
    vision: [
      { id:'llava-hf/llava-1.5-7b-hf',                  name:'LLaVA 1.5 7B',             ctx:4096,   tags:['vision','multimodal'], note:'✅ Image + text, free serverless, reliable' },
      { id:'llava-hf/llava-v1.6-mistral-7b-hf',         name:'LLaVA 1.6 Mistral 7B',     ctx:32768,  tags:['vision','multimodal'], note:'✅ Better vision on Mistral backbone' },
      { id:'llava-hf/llava-v1.6-vicuna-13b-hf',         name:'LLaVA 1.6 Vicuna 13B',     ctx:4096,   tags:['vision','multimodal'], note:'✅ Larger vision model' },
      { id:'microsoft/Phi-3.5-vision-instruct',         name:'Phi-3.5 Vision 128K',      ctx:131072, tags:['vision','multimodal'], note:'✅ Microsoft vision, 128K context' },
      { id:'Qwen/Qwen2-VL-7B-Instruct',                 name:'Qwen2-VL 7B Vision',       ctx:32768,  tags:['vision','multimodal'], note:'✅ Strong OCR + chart understanding' },
      { id:'Qwen/Qwen2-VL-2B-Instruct',                 name:'Qwen2-VL 2B Vision (fast)',ctx:32768,  tags:['vision','fast'],       note:'✅ Small fast vision model' },
      { id:'Salesforce/blip2-opt-2.7b',                 name:'BLIP-2 OPT 2.7B',          ctx:512,    tags:['vision','captioning'], note:'✅ Image captioning, always free' },
      { id:'Salesforce/blip-image-captioning-large',    name:'BLIP Captioning Large',    ctx:512,    tags:['vision','captioning'], note:'✅ Reliable image captioning' },
      { id:'nlpconnect/vit-gpt2-image-captioning',      name:'ViT-GPT2 Captioning',      ctx:512,    tags:['vision','captioning'], note:'✅ Tiny always-available vision' },
      { id:'facebook/detr-resnet-50',                   name:'DETR Object Detection',    ctx:0,      tags:['vision','detection'],  note:'✅ Object detection in images' },
    ],

    // ── Uncensored / Unfiltered ─────────────────────────────────────────────
    uncensored: [
      { id:'cognitivecomputations/dolphin-2.9-llama3-8b',         name:'Dolphin 2.9 Llama3 8B',   ctx:8192,   tags:['uncensored'],  note:'🔓 Popular uncensored model, no RLHF filter' },
      { id:'cognitivecomputations/dolphin-2.8-mistral-7b-v02',   name:'Dolphin 2.8 Mistral 7B',  ctx:32768,  tags:['uncensored'],  note:'🔓 Uncensored Mistral fine-tune' },
      { id:'cognitivecomputations/dolphin-2.2.1-mistral-7b',     name:'Dolphin 2.2.1 Mistral',   ctx:32768,  tags:['uncensored'],  note:'🔓 Classic dolphin uncensored' },
      { id:'NousResearch/Nous-Hermes-2-Mistral-7B-DPO',          name:'Nous Hermes 2 Mistral DPO',ctx:32768, tags:['uncensored'],  note:'🔓 DPO-tuned, fewer refusals' },
      { id:'NousResearch/Nous-Hermes-llama-2-7b',                name:'Nous Hermes Llama2 7B',   ctx:4096,   tags:['uncensored'],  note:'🔓 Classic Nous Hermes' },
      { id:'WizardLM/WizardLM-7B-V1.0',                         name:'WizardLM 7B',             ctx:2048,   tags:['uncensored','instruction'],note:'🔓 Follows complex instructions' },
      { id:'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',    name:'OpenAssistant Pythia 12B',ctx:2048,   tags:['uncensored','chat'],note:'🔓 Community-trained, minimal filtering' },
    ],

    // ── Code-focused ────────────────────────────────────────────────────────
    code: [
      { id:'Qwen/Qwen2.5-Coder-7B-Instruct',            name:'Qwen 2.5 Coder 7B',        ctx:131072, tags:['code'],  note:'✅ Best free HF code model' },
      { id:'Qwen/Qwen2.5-Coder-32B-Instruct',           name:'Qwen 2.5 Coder 32B',       ctx:131072, tags:['code','large'],note:'✅ Largest free code model on HF' },
      { id:'bigcode/starcoder2-15b-instruct-v0.1',      name:'StarCoder 2 15B',          ctx:16384,  tags:['code'],  note:'✅ BigCode starcoder, 600+ languages' },
      { id:'codellama/CodeLlama-7b-Instruct-hf',        name:'CodeLlama 7B Instruct',    ctx:16384,  tags:['code'],  note:'✅ Meta CodeLlama instruct' },
      { id:'codellama/CodeLlama-13b-Instruct-hf',       name:'CodeLlama 13B Instruct',   ctx:16384,  tags:['code','large'],note:'✅ Larger CodeLlama' },
      { id:'deepseek-ai/deepseek-coder-6.7b-instruct',  name:'DeepSeek Coder 6.7B',      ctx:16384,  tags:['code'],  note:'✅ Strong code + math' },
    ],
  };

  // Flat list for iteration
  const HF_FREE_ALL = [
    ...HF_FREE_MODELS.text,
    ...HF_FREE_MODELS.vision,
    ...HF_FREE_MODELS.uncensored,
    ...HF_FREE_MODELS.code,
  ];

  // ══════════════════════════════════════════════════════════════════════════
  //  OLLAMA LOCAL FREE MODELS  (fully offline, no API key, runs on your GPU/CPU)
  // ══════════════════════════════════════════════════════════════════════════
  const OLLAMA_MODELS = {

    // ── Text / General ──────────────────────────────────────────────────────
    text: [
      { id:'llama3.2:3b',         name:'Llama 3.2 3B',              size:'2GB',  tags:['text','fast'],        note:'Default starter — fast on CPU, good quality' },
      { id:'llama3.2:1b',         name:'Llama 3.2 1B (tiny)',       size:'0.8GB',tags:['text','tiny','fast'], note:'Runs on anything, ultra fast' },
      { id:'llama3.1:8b',         name:'Llama 3.1 8B',              size:'4.7GB',tags:['text','code'],        note:'Best general Llama, 128K context' },
      { id:'llama3.1:70b',        name:'Llama 3.1 70B',             size:'40GB', tags:['text','large'],       note:'Huge, needs 64GB RAM or good GPU' },
      { id:'mistral',             name:'Mistral 7B',                size:'4.1GB',tags:['text','code'],        note:'Reliable, great for code + chat' },
      { id:'mistral-nemo',        name:'Mistral Nemo 12B',          size:'7.1GB',tags:['text','code'],        note:'Newer Mistral, better reasoning' },
      { id:'gemma2:9b',           name:'Gemma 2 9B',                size:'5.5GB',tags:['text'],               note:'Google Gemma 2, strong reasoning' },
      { id:'gemma2:2b',           name:'Gemma 2 2B (fast)',         size:'1.6GB',tags:['text','fast'],        note:'Small but capable' },
      { id:'phi3:mini',           name:'Phi-3 Mini',                size:'2.3GB',tags:['text','small'],       note:'Microsoft Phi-3, efficient' },
      { id:'phi3.5',              name:'Phi-3.5',                   size:'2.2GB',tags:['text'],               note:'Improved Phi-3.5' },
      { id:'qwen2.5:7b',          name:'Qwen 2.5 7B',               size:'4.7GB',tags:['text','multilingual'],note:'Strong multilingual' },
      { id:'qwen2.5:14b',         name:'Qwen 2.5 14B',              size:'9GB',  tags:['text','large'],       note:'Better quality Qwen' },
    ],

    // ── Multimodal / Vision ─────────────────────────────────────────────────
    vision: [
      { id:'llava:7b',             name:'LLaVA 7B',                  size:'4.5GB',tags:['vision','multimodal'], note:'✅ Most popular local vision model — analyze images with text prompts' },
      { id:'llava:13b',            name:'LLaVA 13B',                 size:'8GB',  tags:['vision','multimodal'], note:'✅ Better quality vision, needs more RAM' },
      { id:'llava:34b',            name:'LLaVA 34B',                 size:'20GB', tags:['vision','multimodal','large'],note:'✅ Best quality LLaVA, needs 32GB+ RAM' },
      { id:'llava-llama3',         name:'LLaVA + Llama 3 Vision',    size:'5.5GB',tags:['vision','multimodal'], note:'✅ LLaVA on Llama 3 backbone, improved' },
      { id:'llava-phi3',           name:'LLaVA + Phi-3 Vision',      size:'2.9GB',tags:['vision','multimodal','small'],note:'✅ Smallest practical vision model' },
      { id:'moondream',            name:'Moondream 2 (tiny vision)',  size:'1.7GB',tags:['vision','tiny'],        note:'✅ Runs on CPU, image Q&A and captioning' },
      { id:'bakllava',             name:'BakLLaVA',                  size:'4.7GB',tags:['vision','multimodal'], note:'✅ Mistral-based vision model' },
      { id:'minicpm-v',            name:'MiniCPM-V Vision',          size:'5.5GB',tags:['vision','multimodal'], note:'✅ Excellent OCR + document understanding' },
      { id:'qwen2-vl',             name:'Qwen2-VL Vision',           size:'5GB',  tags:['vision','multimodal'], note:'✅ Strong charts, tables, OCR, multiple images' },
    ],

    // ── Uncensored / Unfiltered ─────────────────────────────────────────────
    uncensored: [
      { id:'dolphin3',             name:'Dolphin 3 (latest)',         size:'4.7GB',tags:['uncensored'],  note:'🔓 Latest Dolphin uncensored — best quality, Llama backbone' },
      { id:'dolphin-llama3',       name:'Dolphin Llama 3',           size:'4.7GB',tags:['uncensored'],  note:'🔓 Dolphin on Llama 3 — very capable uncensored' },
      { id:'dolphin-mixtral',      name:'Dolphin Mixtral 8x7B',      size:'26GB', tags:['uncensored','large'],note:'🔓 Uncensored MOE model, needs 32GB RAM' },
      { id:'dolphin-phi',          name:'Dolphin Phi',               size:'2.2GB',tags:['uncensored','small'],note:'🔓 Tiny uncensored, great for CPU' },
      { id:'dolphin-mistral',      name:'Dolphin Mistral',           size:'4.1GB',tags:['uncensored'],  note:'🔓 Classic uncensored Mistral' },
      { id:'nous-hermes2',         name:'Nous Hermes 2',             size:'4.1GB',tags:['uncensored'],  note:'🔓 Nous Research uncensored, minimal filtering' },
      { id:'nous-hermes2-mixtral', name:'Nous Hermes 2 Mixtral',     size:'26GB', tags:['uncensored','large'],note:'🔓 Large uncensored MOE, high quality' },
      { id:'wizard-vicuna-uncensored',name:'Wizard Vicuna Uncensored',size:'7.4GB',tags:['uncensored'], note:'🔓 Classic uncensored model' },
      { id:'orca-mini',            name:'Orca Mini (uncensored)',     size:'2GB',  tags:['uncensored','small'],note:'🔓 Tiny uncensored, runs on CPU' },
      { id:'samantha-mistral',     name:'Samantha Mistral',          size:'4.1GB',tags:['uncensored'],  note:'🔓 Empathetic uncensored companion' },
      { id:'yarn-mistral',         name:'YaRN Mistral 128K',         size:'4.1GB',tags:['uncensored','longctx'],note:'🔓 Uncensored + 128K context window' },
    ],

    // ── Code-focused ────────────────────────────────────────────────────────
    code: [
      { id:'qwen2.5-coder:7b',     name:'Qwen 2.5 Coder 7B',        size:'4.7GB',tags:['code'],  note:'✅ Best local code model for most machines' },
      { id:'qwen2.5-coder:14b',    name:'Qwen 2.5 Coder 14B',       size:'9GB',  tags:['code'],  note:'✅ Better quality code, needs 16GB RAM' },
      { id:'qwen2.5-coder:32b',    name:'Qwen 2.5 Coder 32B',       size:'20GB', tags:['code'],  note:'✅ Best open-source code model' },
      { id:'codellama:7b',         name:'CodeLlama 7B Instruct',     size:'3.8GB',tags:['code'],  note:'✅ Meta CodeLlama, 100+ languages' },
      { id:'codellama:13b',        name:'CodeLlama 13B',             size:'7.4GB',tags:['code'],  note:'✅ Better CodeLlama quality' },
      { id:'codellama:34b',        name:'CodeLlama 34B',             size:'19GB', tags:['code'],  note:'✅ Best CodeLlama quality' },
      { id:'deepseek-coder-v2',    name:'DeepSeek Coder V2',         size:'8.9GB',tags:['code'],  note:'✅ Excellent code + math reasoning' },
      { id:'starcoder2:7b',        name:'StarCoder 2 7B',            size:'4.3GB',tags:['code'],  note:'✅ BigCode, 600+ programming languages' },
      { id:'deepseek-r1:7b',       name:'DeepSeek-R1 7B',            size:'4.7GB',tags:['code','reasoning'],note:'✅ Chain-of-thought reasoning' },
      { id:'deepseek-r1:14b',      name:'DeepSeek-R1 14B',           size:'9GB',  tags:['code','reasoning'],note:'✅ Better CoT reasoning' },
    ],
  };

  const OLLAMA_ALL = [
    ...OLLAMA_MODELS.text,
    ...OLLAMA_MODELS.vision,
    ...OLLAMA_MODELS.uncensored,
    ...OLLAMA_MODELS.code,
  ];

  // ── Default free config ────────────────────────────────────────────────────
  const DEFAULT_CONFIG = {
    primaryProvider:  'openrouter',
    openrouterModel:  OR_FREE_MODELS.text[0].id,
    hfModel:          HF_FREE_MODELS.text[0].id,
    hfInferenceMode:  'serverless',
    ollamaUrl:        'http://localhost:11434',
    ollamaModel:      OLLAMA_MODELS.text[0].id,
    groqModel:        'llama-3.3-70b-versatile',
    maxTokens:        4096,
    temperature:      0.3,
    maxSteps:         15,
    autoExec:         'safe',
    webSearch:        'enabled',
  };

  // ── Apply free defaults ─────────────────────────────────────────────────────
  function applyFreeDefaults(cfg) {
    const out = { ...DEFAULT_CONFIG, ...cfg };
    if (!cfg.primaryProvider) out.primaryProvider = DEFAULT_CONFIG.primaryProvider;
    if (!out.openrouterModel || out.openrouterModel === 'anthropic/claude-3.5-sonnet') out.openrouterModel = DEFAULT_CONFIG.openrouterModel;
    if (!out.hfModel)         out.hfModel          = DEFAULT_CONFIG.hfModel;
    if (!out.hfInferenceMode) out.hfInferenceMode  = DEFAULT_CONFIG.hfInferenceMode;
    if (!out.ollamaUrl)       out.ollamaUrl        = DEFAULT_CONFIG.ollamaUrl;
    if (!out.ollamaModel)     out.ollamaModel      = DEFAULT_CONFIG.ollamaModel;
    return out;
  }

  // ── Auto-detect best working free provider ─────────────────────────────────
  async function autoDetectProvider(cfg) {
    const results = { tried:[], winner:null, detail:'' };

    if (cfg.openrouterKey) {
      results.tried.push('openrouter');
      try {
        const r = await nexus.httpRequest({
          method:'POST', url:'https://openrouter.ai/api/v1/chat/completions',
          headers:{ 'Authorization':`Bearer ${cfg.openrouterKey}`, 'Content-Type':'application/json', 'HTTP-Referer':'https://nexus-agent.app', 'X-Title':'Nexus Agent' },
          body:{ model:OR_FREE_MODELS.text[0].id, messages:[{role:'user',content:'Hi'}], max_tokens:5 },
          timeout:10,
        });
        if (r.status===200 && r.data?.choices?.[0]?.message?.content) {
          results.winner='openrouter'; results.detail=`OpenRouter (${OR_FREE_MODELS.text[0].name} free)`; return results;
        }
      } catch {}
    }

    results.tried.push('huggingface');
    try {
      const hm = cfg.hfModel || HF_FREE_MODELS.text[0].id;
      const hdrs = { 'Content-Type':'application/json' };
      if (cfg.hfToken) hdrs['Authorization'] = `Bearer ${cfg.hfToken}`;
      const r = await nexus.httpRequest({ method:'POST', url:`https://api-inference.huggingface.co/models/${hm}`, headers:hdrs, body:{ inputs:'Hi', parameters:{ max_new_tokens:5, return_full_text:false }, options:{ wait_for_model:false, use_cache:true } }, timeout:12 });
      if (r.status===200||r.status===503) { results.winner='huggingface'; results.detail=`HuggingFace serverless — ${hm}${r.status===503?' (loading~20s)':''}`; return results; }
    } catch {}

    results.tried.push('ollama');
    try {
      const r = await nexus.httpRequest({ method:'GET', url:`${cfg.ollamaUrl||'http://localhost:11434'}/api/tags`, headers:{}, timeout:3 });
      if (r.status===200) {
        const avail = (r.data?.models||[]).map(m=>m.name);
        const best = OLLAMA_ALL.map(m=>m.id).find(id=>avail.some(a=>a.startsWith(id.split(':')[0]))) || avail[0] || OLLAMA_MODELS.text[0].id;
        results.winner='ollama'; results.detail=`Ollama local — ${best}`; return results;
      }
    } catch {}

    results.winner=null; results.detail='No provider reachable.';
    return results;
  }

  // ── Boot setup ──────────────────────────────────────────────────────────────
  async function bootSetup(cfg, updateFn) {
    const enriched     = applyFreeDefaults(cfg);
    const isFirstLaunch= !cfg.primaryProvider||(cfg.primaryProvider==='anthropic'&&!cfg.anthropicKey);
    const hasAnyKey    = !!(cfg.anthropicKey||cfg.openaiKey||cfg.openrouterKey||cfg.groqKey||cfg.hfToken||cfg.geminiKey||cfg.primaryProvider==='ollama');
    if (isFirstLaunch) { enriched.primaryProvider='openrouter'; await nexus.saveConfig(enriched); }
    const detected = await autoDetectProvider(enriched);
    if (detected.winner && (isFirstLaunch||!hasAnyKey)) {
      enriched.primaryProvider = detected.winner;
      if (detected.winner==='huggingface') enriched.hfInferenceMode='serverless';
      updateFn(enriched); await nexus.saveConfig(enriched);
    }
    return { cfg:enriched, detected, isFirstLaunch };
  }

  // ── Setup banner ────────────────────────────────────────────────────────────
  function renderSetupBanner(detected, isFirstLaunch) {
    if (!isFirstLaunch && detected.winner) return;
    const banner = document.createElement('div');
    banner.id = 'free-tier-banner';
    if (detected.winner) {
      banner.style.cssText='background:#052e16;border:1px solid #14532d;border-radius:8px;padding:10px 14px;margin-bottom:4px;display:flex;align-items:flex-start;gap:10px';
      banner.innerHTML=`<div style="font-size:16px">✅</div><div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--green)">Free provider active: ${esc(detected.detail)}</div><div style="font-size:11px;color:var(--text2);margin-top:2px">No payment required. Add a key in Settings for more options.</div></div><button style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px" onclick="this.parentElement.remove()">✕</button>`;
    } else {
      banner.style.cssText='background:#1a1000;border:1px solid var(--hf);border-radius:8px;padding:14px 16px;margin-bottom:4px;position:relative';
      banner.innerHTML=`
        <div style="font-size:14px;font-weight:700;color:var(--hf);margin-bottom:12px">🚀 Get Started Free — choose a provider</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin-bottom:12px">
          ${freeCard('🔀','OpenRouter','FREE ACCOUNT','#052e16','var(--green)','#14532d','15+ free models: Llama, Mistral, Gemma, DeepSeek. Best quality. Free signup.','https://openrouter.ai/keys','Get Free Key ↗','FreeTier.applyOrFree()','Set Default')}
          ${freeCard('🤗','HuggingFace','NO KEY NEEDED','#1f1400','var(--hf)','#4a3000','Mistral, Zephyr, Qwen, LLaVA vision. Zero config. May be slow on first call.','https://huggingface.co/settings/tokens','Get Token ↗','FreeTier.applyHfFree()','Use Now')}
          ${freeCard('🦙','Ollama (Local)','FULLY OFFLINE','#1f1008','var(--orange)','#4a2a10','Llama, Mistral, LLaVA vision, Dolphin uncensored. Private, unlimited.','https://ollama.ai/download','Download Ollama ↗','Installer.installOllamaFull()','Install + Setup')}
          ${freeCard('⚡','Groq','FREE TIER','#0f1a1f','var(--accent3)','#1a3a4a','Llama 3.3 70B at 500+ tokens/sec. Free tier, generous limits.','https://console.groq.com/keys','Get Free Key ↗','FreeTier.applyGroqFree()','Set Default')}
        </div>
        <div style="font-size:11px;color:var(--text3);display:flex;align-items:center;gap:7px;flex-wrap:wrap">
          <span>Or paste any key:</span>
          <input id="ft-key-input" style="background:var(--bg2);border:1px solid var(--border2);color:var(--text0);border-radius:4px;padding:4px 8px;font-size:11px;width:260px;outline:none" placeholder="sk-ant-… / sk-or-… / hf_… / gsk_…">
          <button class="btn btn-sec btn-sm" onclick="FreeTier.pasteKey()">Auto-detect & Apply</button>
        </div>
        <button style="position:absolute;top:10px;right:12px;background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px" onclick="document.getElementById('free-tier-banner').remove()">✕</button>`;
    }
    const msgs = document.getElementById('msgs');
    if (msgs) msgs.insertAdjacentElement('afterbegin', banner);
  }

  function freeCard(icon,title,badge,bgCol,fgCol,borderCol,desc,link,linkLabel,action,actionLabel) {
    return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:10px 12px">
      <div style="font-size:12px;font-weight:700;color:var(--text0);margin-bottom:4px">${icon} ${title} <span style="background:${bgCol};color:${fgCol};font-size:9px;border-radius:99px;padding:1px 6px;border:1px solid ${borderCol}">${badge}</span></div>
      <div style="font-size:11px;color:var(--text2);margin-bottom:7px;line-height:1.4">${desc}</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <a class="btn btn-pri btn-sm" href="${link}" target="_blank" style="text-decoration:none">${linkLabel}</a>
        <button class="btn btn-sec btn-sm" onclick="${action}">${actionLabel}</button>
      </div>
    </div>`;
  }

  // ── One-click apply helpers ─────────────────────────────────────────────────
  async function applyOrFree() {
    const key = (document.getElementById('ft-key-input')?.value||'').trim()||S.cfg.openrouterKey||'';
    S.cfg.primaryProvider='openrouter'; S.cfg.openrouterModel=OR_FREE_MODELS.text[0].id;
    if (key) S.cfg.openrouterKey=key;
    await nexus.saveConfig(S.cfg); updateStatus(); renderTools(); populateSettings();
    toast('OpenRouter free model set ✓','ok'); document.getElementById('free-tier-banner')?.remove();
  }
  async function applyHfFree() {
    S.cfg.primaryProvider='huggingface'; S.cfg.hfModel=HF_FREE_MODELS.text[0].id; S.cfg.hfInferenceMode='serverless';
    await nexus.saveConfig(S.cfg); updateStatus(); renderTools(); populateSettings();
    toast('HuggingFace serverless ✓ — no key needed','ok'); document.getElementById('free-tier-banner')?.remove();
    sysMsg(`✅ HuggingFace serverless: ${HF_FREE_MODELS.text[0].id}\nNo key required. First call may take ~20s (cold start).`);
  }
  async function applyOllamaFree() {
    S.cfg.primaryProvider='ollama'; S.cfg.ollamaUrl='http://localhost:11434'; S.cfg.ollamaModel=OLLAMA_MODELS.text[0].id;
    await nexus.saveConfig(S.cfg); updateStatus(); renderTools(); populateSettings();
    toast('Ollama set ✓ — ensure it is running','ok'); document.getElementById('free-tier-banner')?.remove();
  }
  async function applyGroqFree() {
    const key=(document.getElementById('ft-key-input')?.value||'').trim()||S.cfg.groqKey||'';
    S.cfg.primaryProvider='groq'; S.cfg.groqModel='llama-3.3-70b-versatile';
    if (key) S.cfg.groqKey=key;
    await nexus.saveConfig(S.cfg); updateStatus(); renderTools(); populateSettings();
    toast('Groq set ✓','ok'); document.getElementById('free-tier-banner')?.remove();
  }
  async function pasteKey() {
    const key=(document.getElementById('ft-key-input')?.value||'').trim();
    if (!key) { toast('Paste a key first','er'); return; }
    if (key.startsWith('sk-ant-'))  { S.cfg.anthropicKey  =key; S.cfg.primaryProvider='anthropic'; S.cfg.anthropicModel='claude-sonnet-4-6'; }
    else if (key.startsWith('sk-or-')){ S.cfg.openrouterKey=key; S.cfg.primaryProvider='openrouter'; S.cfg.openrouterModel=OR_FREE_MODELS.text[0].id; }
    else if (key.startsWith('sk-'))   { S.cfg.openaiKey    =key; S.cfg.primaryProvider='openai'; S.cfg.openaiModel='gpt-4o'; }
    else if (key.startsWith('gsk_'))  { S.cfg.groqKey      =key; S.cfg.primaryProvider='groq'; S.cfg.groqModel='llama-3.3-70b-versatile'; }
    else if (key.startsWith('hf_'))   { S.cfg.hfToken      =key; S.cfg.primaryProvider='huggingface'; S.cfg.hfModel=HF_FREE_MODELS.text[0].id; }
    else if (key.startsWith('AIza'))  { S.cfg.geminiKey    =key; S.cfg.primaryProvider='gemini'; S.cfg.geminiModel='gemini-2.0-flash'; }
    else { toast('Prefix not recognised — set manually in Settings','in'); return; }
    await nexus.saveConfig(S.cfg); updateStatus(); renderTools(); populateSettings();
    toast(`✅ ${S.cfg.primaryProvider} applied automatically`,'ok'); document.getElementById('free-tier-banner')?.remove();
  }

  // ── Fetch live OR free models ───────────────────────────────────────────────
  async function fetchLiveFreeModels(orKey) {
    if (!orKey) return OR_FREE_ALL;
    try {
      const r = await nexus.httpRequest({ method:'GET', url:'https://openrouter.ai/api/v1/models', headers:{ 'Authorization':`Bearer ${orKey}`, 'Accept':'application/json' }, timeout:10 });
      if (r.status===200&&r.data?.data) {
        const free=r.data.data.filter(m=>parseFloat(m.pricing?.prompt||1)===0||m.id.endsWith(':free'));
        return free.length ? free.map(m=>({ id:m.id, name:m.name||m.id, ctx:m.context_length||4096, tags:['free'] })) : OR_FREE_ALL;
      }
    } catch {}
    return OR_FREE_ALL;
  }

  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  return {
    OR_FREE_MODELS, OR_FREE_ALL,
    HF_FREE_MODELS, HF_FREE_ALL,
    OLLAMA_MODELS, OLLAMA_ALL,
    DEFAULT_CONFIG,
    applyFreeDefaults, autoDetectProvider, bootSetup, renderSetupBanner,
    applyOrFree, applyHfFree, applyOllamaFree, applyGroqFree, pasteKey,
    fetchLiveFreeModels,
  };
})();
