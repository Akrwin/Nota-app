const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('nota', {
  openFolder:   ()             => ipcRenderer.invoke('open-folder'),
  scanFolder:   (p)            => ipcRenderer.invoke('scan-folder', p),
  readFile:     (p)            => ipcRenderer.invoke('read-file', p),
  writeFile:    (p, c)         => ipcRenderer.invoke('write-file', p, c),
  createFile:   (folder, name) => ipcRenderer.invoke('create-file', folder, name),
  deleteFile:   (p)            => ipcRenderer.invoke('delete-file', p),
  renameFile:   (old, name)    => ipcRenderer.invoke('rename-file', old, name),
  windowMin:    ()             => ipcRenderer.send('window-minimize'),
  windowMax:    ()             => ipcRenderer.send('window-maximize'),
  windowClose:  ()             => ipcRenderer.send('window-close'),
})
