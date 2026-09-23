/* ═══════════════════════════════════════════════════════
   NEXUS AGENT — Media Generation
   Image & Video via multiple AI providers
═══════════════════════════════════════════════════════ */

window.Media = (() => {

  // ── Image providers ──────────────────────────────────
  const IMAGE_PROVIDERS = {
    dalle3: {
      name: 'DALL-E 3 (OpenAI)',
      key: 'openaiKey',
      sizes: ['1024x1024','1792x1024','1024x1792'],
      styles: ['vivid','natural'],
      qualities: ['standard','hd'],
      generate: generateDalle3,
    },
    dalle2: {
      name: 'DALL-E 2 (OpenAI)',
      key: 'openaiKey',
      sizes: ['256x256','512x512','1024x1024'],
      generate: generateDalle2,
    },
    stability_xl: {
      name: 'Stable Diffusion XL (Stability AI)',
      key: 'stabilityKey',
      sizes: ['1024x1024','1152x896','896x1152','1216x832','832x1216','1344x768','768x1344'],
      generate: generateStabilityXL,
    },
    stability_core: {
      name: 'Stable Image Core (Stability AI)',
      key: 'stabilityKey',
      sizes: ['1024x1024'],
      generate: generateStabilityCore,
    },
    stability_ultra: {
      name: 'Stable Image Ultra (Stability AI)',
      key: 'stabilityKey',
      sizes: ['1024x1024'],
      generate: generateStabilityUltra,
    },
    flux_schnell: {
      name: 'Flux Schnell (Together AI / BFL)',
      key: 'togetherKey',
      sizes: ['1024x1024','1024x768','768x1024'],
      generate: generateFluxTogether,
      model: 'black-forest-labs/FLUX.1-schnell',
    },
    flux_dev: {
      name: 'Flux Dev (Together AI / BFL)',
      key: 'togetherKey',
      sizes: ['1024x1024'],
      generate: generateFluxTogether,
      model: 'black-forest-labs/FLUX.1-dev',
    },
    flux_pro: {
      name: 'Flux Pro (BFL API)',
      key: 'bflKey',
      sizes: ['1024x1024','1440x1440'],
      generate: generateFluxPro,
    },
    hf_image: {
      name: 'HuggingFace Image Model',
      key: 'hfToken',
      sizes: ['512x512','768x768','1024x1024'],
      generate: generateHFImage,
    },
    ideogram: {
      name: 'Ideogram v2 (Text rendering)',
      key: 'ideogramKey',
      sizes: ['ASPECT_1_1','ASPECT_16_9','ASPECT_9_16','ASPECT_4_3','ASPECT_3_4'],
      generate: generateIdeogram,
    },
    getimgai: {
      name: 'GetImg.ai (SD/Flux)',
      key: 'getimgKey',
      sizes: ['512x512','768x768','1024x1024'],
      generate: generateGetImg,
    },
  };

  // ── Video providers ──────────────────────────────────
  const VIDEO_PROVIDERS = {
    runway_gen4: {
      name: 'Runway Gen-4 (Text/Image→Video)',
      key: 'runwayKey',
      maxDuration: 10,
      generate: generateRunwayGen4,
    },
    runway_gen3: {
      name: 'Runway Gen-3 Alpha',
      key: 'runwayKey',
      maxDuration: 10,
      generate: generateRunwayGen3,
    },
    kling_21: {
      name: 'Kling AI 2.1 (Text→Video)',
      key: 'klingKey',
      maxDuration: 10,
      generate: generateKling,
    },
    luma_ray: {
      name: 'Luma Dream Machine (Ray 2)',
      key: 'lumaKey',
      maxDuration: 5,
      generate: generateLuma,
    },
    pika: {
      name: 'Pika 2.1 (Text/Image→Video)',
      key: 'pikaKey',
      maxDuration: 5,
      generate: generatePika,
    },
    minimax_video: {
      name: 'MiniMax Video-01',
      key: 'minimaxKey',
      maxDuration: 6,
      generate: generateMinimax,
    },
    hailuo: {
      name: 'Hailuo AI (MiniMax)',
      key: 'hailuoKey',
      maxDuration: 6,
      generate: generateHailuo,
    },
    sora: {
      name: 'Sora (OpenAI) — via API',
      key: 'openaiKey',
      maxDuration: 20,
      generate: generateSora,
    },
  };

  // ── Image generation implementations ────────────────
  async function generateDalle3(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.openai.com/v1/images/generations',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json' },
      body:{ model:'dall-e-3', prompt:cfg.prompt, n:1, size:cfg.size||'1024x1024', quality:cfg.quality||'standard', style:cfg.style||'vivid', response_format:'b64_json' },
    });
    if (r.status!==200) throw new Error(r.data?.error?.message||`HTTP ${r.status}`);
    return { type:'image', b64:r.data.data[0].b64_json, revisedPrompt:r.data.data[0].revised_prompt };
  }

  async function generateDalle2(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.openai.com/v1/images/generations',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json' },
      body:{ model:'dall-e-2', prompt:cfg.prompt, n:1, size:cfg.size||'1024x1024', response_format:'b64_json' },
    });
    if (r.status!==200) throw new Error(r.data?.error?.message||`HTTP ${r.status}`);
    return { type:'image', b64:r.data.data[0].b64_json };
  }

  async function generateStabilityXL(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json', 'Accept':'application/json' },
      body:{ text_prompts:[{ text:cfg.prompt, weight:1 },...(cfg.negPrompt?[{ text:cfg.negPrompt, weight:-1 }]:[])], cfg_scale:cfg.cfgScale||7, height:parseInt((cfg.size||'1024x1024').split('x')[1]), width:parseInt((cfg.size||'1024x1024').split('x')[0]), steps:cfg.steps||30, samples:1 },
    });
    if (r.status!==200) throw new Error(r.data?.message||`HTTP ${r.status}`);
    return { type:'image', b64:r.data.artifacts[0].base64 };
  }

  async function generateStabilityCore(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.stability.ai/v2beta/stable-image/generate/core',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json', 'Accept':'application/json' },
      body:{ prompt:cfg.prompt, negative_prompt:cfg.negPrompt||'', aspect_ratio:'1:1', output_format:'png' },
    });
    if (r.status!==200) throw new Error(r.data?.errors?.join(', ')||`HTTP ${r.status}`);
    return { type:'image', b64:r.data.image };
  }

  async function generateStabilityUltra(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.stability.ai/v2beta/stable-image/generate/ultra',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json', 'Accept':'application/json' },
      body:{ prompt:cfg.prompt, negative_prompt:cfg.negPrompt||'', aspect_ratio:'1:1', output_format:'png' },
    });
    if (r.status!==200) throw new Error(r.data?.errors?.join(', ')||`HTTP ${r.status}`);
    return { type:'image', b64:r.data.image };
  }

  async function generateFluxTogether(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.together.xyz/v1/images/generations',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json' },
      body:{ model:cfg.providerCfg?.model||'black-forest-labs/FLUX.1-schnell', prompt:cfg.prompt, width:parseInt((cfg.size||'1024x1024').split('x')[0]), height:parseInt((cfg.size||'1024x1024').split('x')[1]), steps:cfg.steps||4, n:1, response_format:'b64_json' },
    });
    if (r.status!==200) throw new Error(r.data?.error?.message||`HTTP ${r.status}`);
    return { type:'image', b64:r.data.data[0].b64_json };
  }

  async function generateFluxPro(cfg) {
    // BFL direct API
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.bfl.ml/v1/flux-pro-1.1',
      headers:{ 'x-key':cfg.apiKey, 'Content-Type':'application/json' },
      body:{ prompt:cfg.prompt, width:parseInt((cfg.size||'1024x1024').split('x')[0]), height:parseInt((cfg.size||'1024x1024').split('x')[1]), prompt_upsampling:false, safety_tolerance:2, output_format:'png' },
    });
    if (r.status!==200) throw new Error(`BFL ${r.status}: ${JSON.stringify(r.data)}`);
    // Poll for result
    const id = r.data.id;
    for (let i=0; i<30; i++) {
      await new Promise(res=>setTimeout(res,2000));
      const poll = await nexus.httpRequest({ method:'GET', url:`https://api.bfl.ml/v1/get_result?id=${id}`, headers:{ 'x-key':cfg.apiKey } });
      if (poll.data?.status==='Ready') return { type:'image', url:poll.data.result.sample };
      if (poll.data?.status==='Error') throw new Error(`BFL error: ${poll.data.error}`);
    }
    throw new Error('BFL Flux Pro: timeout waiting for result');
  }

  async function generateHFImage(cfg) {
    const model = cfg.hfImageModel || 'stabilityai/stable-diffusion-xl-base-1.0';
    const headers = { 'Content-Type':'application/json' };
    if (cfg.apiKey) headers['Authorization'] = `Bearer ${cfg.apiKey}`;
    const r = await nexus.httpRequest({
      method:'POST', url:`https://api-inference.huggingface.co/models/${model}`,
      headers, body:{ inputs:cfg.prompt, parameters:{ negative_prompt:cfg.negPrompt||'', num_inference_steps:cfg.steps||30, guidance_scale:cfg.cfgScale||7.5 }, options:{ wait_for_model:true } }, timeout:120,
    });
    if (r.status!==200) throw new Error(`HF ${r.status}: ${JSON.stringify(r.data)}`);
    // HF returns base64 PNG
    if (r.data?._raw) {
      const raw = r.data._raw;
      if (raw.startsWith('data:')) return { type:'image', dataUrl:raw };
      return { type:'image', b64:btoa(raw) };
    }
    return { type:'image', b64:r.data?.generated_image||'' };
  }

  async function generateIdeogram(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.ideogram.ai/generate',
      headers:{ 'Api-Key':cfg.apiKey, 'Content-Type':'application/json' },
      body:{ image_request:{ prompt:cfg.prompt, aspect_ratio:cfg.size||'ASPECT_1_1', model:'V_2', magic_prompt_option:'AUTO' } },
    });
    if (r.status!==200) throw new Error(`Ideogram ${r.status}: ${JSON.stringify(r.data)}`);
    return { type:'image', url:r.data.data[0].url };
  }

  async function generateGetImg(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.getimg.ai/v1/stable-diffusion-xl/text-to-image',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json' },
      body:{ prompt:cfg.prompt, negative_prompt:cfg.negPrompt||'', width:parseInt((cfg.size||'1024x1024').split('x')[0]), height:parseInt((cfg.size||'1024x1024').split('x')[1]), steps:cfg.steps||30, guidance:cfg.cfgScale||7.5, output_format:'png', response_format:'b64' },
    });
    if (r.status!==200) throw new Error(`GetImg ${r.status}: ${JSON.stringify(r.data)}`);
    return { type:'image', b64:r.data.image };
  }

  // ── Video generation implementations ─────────────────
  async function generateRunwayGen4(cfg) {
    const body = { promptText:cfg.prompt, duration:cfg.duration||5, ratio:'1280:720', model:'gen4_turbo' };
    if (cfg.imageB64) body.promptImage = `data:image/jpeg;base64,${cfg.imageB64}`;
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.dev.runwayml.com/v1/image_to_video',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json', 'X-Runway-Version':'2024-11-06' },
      body,
    });
    if (r.status!==200) throw new Error(`Runway ${r.status}: ${JSON.stringify(r.data)}`);
    return { type:'video', taskId:r.data.id, provider:'runway', apiKey:cfg.apiKey, pollUrl:`https://api.dev.runwayml.com/v1/tasks/${r.data.id}` };
  }

  async function generateRunwayGen3(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.dev.runwayml.com/v1/image_to_video',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json', 'X-Runway-Version':'2024-11-06' },
      body:{ promptText:cfg.prompt, duration:cfg.duration||5, ratio:'1280:720', model:'gen3a_turbo' },
    });
    if (r.status!==200) throw new Error(`Runway Gen3 ${r.status}: ${JSON.stringify(r.data)}`);
    return { type:'video', taskId:r.data.id, provider:'runway', apiKey:cfg.apiKey, pollUrl:`https://api.dev.runwayml.com/v1/tasks/${r.data.id}` };
  }

  async function generateKling(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.klingai.com/v1/videos/text2video',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json' },
      body:{ model_name:'kling-v2-master', prompt:cfg.prompt, negative_prompt:cfg.negPrompt||'', cfg_scale:0.5, mode:'std', duration:String(cfg.duration||5) },
    });
    if (r.status!==200) throw new Error(`Kling ${r.status}: ${JSON.stringify(r.data)}`);
    return { type:'video', taskId:r.data.data?.task_id, provider:'kling', apiKey:cfg.apiKey };
  }

  async function generateLuma(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.lumalabs.ai/dream-machine/v1/generations',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json' },
      body:{ prompt:cfg.prompt, model:'ray-2', resolution:'720p', duration:`${cfg.duration||5}s` },
    });
    if (r.status!==201 && r.status!==200) throw new Error(`Luma ${r.status}: ${JSON.stringify(r.data)}`);
    return { type:'video', taskId:r.data.id, provider:'luma', apiKey:cfg.apiKey };
  }

  async function generatePika(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.pika.art/v2/generate',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json' },
      body:{ prompt:cfg.prompt, options:{ resolution:'1080p', duration:cfg.duration||5, frameRate:24 } },
    });
    if (r.status!==200) throw new Error(`Pika ${r.status}: ${JSON.stringify(r.data)}`);
    return { type:'video', taskId:r.data.data?.task_id||r.data.id, provider:'pika', apiKey:cfg.apiKey };
  }

  async function generateMinimax(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.minimaxi.chat/v1/video_generation',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json' },
      body:{ model:'video-01', prompt:cfg.prompt },
    });
    if (r.status!==200) throw new Error(`MiniMax ${r.status}: ${JSON.stringify(r.data)}`);
    return { type:'video', taskId:r.data.task_id, provider:'minimax', apiKey:cfg.apiKey };
  }

  async function generateHailuo(cfg) { return generateMinimax(cfg); }

  async function generateSora(cfg) {
    const r = await nexus.httpRequest({
      method:'POST', url:'https://api.openai.com/v1/video/generations',
      headers:{ 'Authorization':`Bearer ${cfg.apiKey}`, 'Content-Type':'application/json' },
      body:{ model:'sora-preview', prompt:cfg.prompt, duration:cfg.duration||5, resolution:'1080p', n:1 },
    });
    if (r.status!==200) throw new Error(`Sora ${r.status}: ${r.data?.error?.message||JSON.stringify(r.data)}`);
    return { type:'video', taskId:r.data.id, provider:'sora', apiKey:cfg.apiKey };
  }

  // ── Poll for video completion ─────────────────────────
  async function pollVideo(task, onProgress) {
    const maxAttempts = 120;
    for (let i=0; i<maxAttempts; i++) {
      await new Promise(r=>setTimeout(r, 3000));
      onProgress?.(`Polling… attempt ${i+1}/${maxAttempts}`);
      try {
        let url, headers, done = false, videoUrl = null;
        if (task.provider==='runway') {
          const r = await nexus.httpRequest({ method:'GET', url:task.pollUrl, headers:{ 'Authorization':`Bearer ${task.apiKey}`, 'X-Runway-Version':'2024-11-06' } });
          if (r.data?.status==='SUCCEEDED') { done=true; videoUrl=r.data.output?.[0]; }
          if (r.data?.status==='FAILED') throw new Error(`Runway failed: ${r.data.failure}`);
        } else if (task.provider==='luma') {
          const r = await nexus.httpRequest({ method:'GET', url:`https://api.lumalabs.ai/dream-machine/v1/generations/${task.taskId}`, headers:{ 'Authorization':`Bearer ${task.apiKey}` } });
          if (r.data?.state==='completed') { done=true; videoUrl=r.data.assets?.video; }
          if (r.data?.state==='failed') throw new Error(`Luma failed: ${r.data.failure_reason}`);
        } else if (task.provider==='kling') {
          const r = await nexus.httpRequest({ method:'GET', url:`https://api.klingai.com/v1/videos/text2video/${task.taskId}`, headers:{ 'Authorization':`Bearer ${task.apiKey}` } });
          if (r.data?.data?.task_status==='succeed') { done=true; videoUrl=r.data.data.task_result?.videos?.[0]?.url; }
          if (r.data?.data?.task_status==='failed') throw new Error('Kling failed');
        }
        if (done && videoUrl) return { url: videoUrl };
      } catch(e) { if (e.message.includes('failed')) throw e; }
    }
    throw new Error('Video generation timed out (6 minutes)');
  }

  // ── Main generate function ────────────────────────────
  async function generate(type, providerKey, cfg, onProgress) {
    const providers = type==='image' ? IMAGE_PROVIDERS : VIDEO_PROVIDERS;
    const prov = providers[providerKey];
    if (!prov) throw new Error(`Unknown ${type} provider: ${providerKey}`);
    const fullCfg = { ...cfg, providerCfg:prov, apiKey:cfg.apiKey||window.S?.cfg?.[prov.key]||'' };
    if (!fullCfg.apiKey) throw new Error(`No API key configured for ${prov.name}`);
    onProgress?.(`Generating with ${prov.name}…`);
    const result = await prov.generate(fullCfg);
    if (result.taskId && type==='video') {
      onProgress?.('Generation queued, polling for result…');
      const final = await pollVideo(result, onProgress);
      return { ...result, ...final };
    }
    return result;
  }

  // ── Save generated media to workspace ─────────────────
  async function saveToWorkspace(result, filename, workspace) {
    const dir = `${workspace}/generated`;
    await nexus.mkdir(dir);
    const fp = `${dir}/${filename}`;
    if (result.b64) {
      await nexus.writeFile(fp, result.b64);
      return fp;
    }
    return result.url || result.dataUrl || null;
  }

  return { IMAGE_PROVIDERS, VIDEO_PROVIDERS, generate, saveToWorkspace, pollVideo };
})();
