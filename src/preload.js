const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nexus', {
  // Window
  minimize:        ()           => ipcRenderer.send('win-minimize'),
  maximize:        ()           => ipcRenderer.send('win-maximize'),
  close:           ()           => ipcRenderer.send('win-close'),
  // Config
  getConfig:       ()           => ipcRenderer.invoke('get-config'),
  saveConfig:      (c)          => ipcRenderer.invoke('save-config', c),
  getWorkspace:    ()           => ipcRenderer.invoke('get-workspace'),
  getModelsDir:    ()           => ipcRenderer.invoke('get-models-dir'),
  // Dialogs
  openWorkspace:   ()           => ipcRenderer.invoke('open-workspace'),
  pickFolder:      ()           => ipcRenderer.invoke('pick-folder'),
  pickFile:        (f)          => ipcRenderer.invoke('pick-file', f),
  openUrl:         (url)        => ipcRenderer.invoke('open-url', url),
  // File system
  listFiles:       (d)          => ipcRenderer.invoke('list-files', d),
  readFile:        (p)          => ipcRenderer.invoke('read-file', p),
  writeFile:       (p,c)        => ipcRenderer.invoke('write-file', p, c),
  deleteFile:      (p)          => ipcRenderer.invoke('delete-file', p),
  renameFile:      (o,n)        => ipcRenderer.invoke('rename-file', o, n),
  mkdir:           (p)          => ipcRenderer.invoke('mkdir', p),
  fileExists:      (p)          => ipcRenderer.invoke('file-exists', p),
  getFileStat:     (p)          => ipcRenderer.invoke('get-file-stat', p),
  // Shell
  execCmd:         (c,d,e)      => ipcRenderer.invoke('exec-cmd', c, d, e),
  execCmdLong:     (c,d,t)      => ipcRenderer.invoke('exec-cmd-long', c, d, t),
  checkCmd:        (cmd)        => ipcRenderer.invoke('check-cmd', cmd),
  runElevated:     (cmd)        => ipcRenderer.invoke('run-elevated', cmd),
  killAll:         ()           => ipcRenderer.invoke('kill-all'),
  // HTTP
  httpRequest:     (o)          => ipcRenderer.invoke('http-request', o),
  httpStream:      (o)          => ipcRenderer.invoke('http-stream', o),
  onStreamChunk:   (cb)         => { ipcRenderer.on('stream-chunk', (_,d) => cb(d)); },
  // HuggingFace
  hfDownload:      (o)          => ipcRenderer.invoke('hf-download-model', o),
  onHfProgress:    (cb)         => { ipcRenderer.on('hf-download-progress', (_,d) => cb(d)); },
  listLocalModels: ()           => ipcRenderer.invoke('list-local-models'),
  // Ollama
  ollamaList:      (u)          => ipcRenderer.invoke('ollama-list', u),
});
