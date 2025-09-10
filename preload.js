const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  cwdChanged: (cwd) => ipcRenderer.send('cwd-changed', cwd),
  onUpdateFileBrowser: (callback) => ipcRenderer.on('update-filebrowser', (event, cwd) => callback(cwd))
});
