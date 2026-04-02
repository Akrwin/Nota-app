const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 700,
    minHeight: 500,
    titleBarStyle: 'hiddenInset',
    frame: false,
    backgroundColor: '#FAF9F7',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'icon.ico')
  })

  win.loadFile(path.join(__dirname, 'index.html'))

  // Custom menu — keep system shortcuts (copy/paste/undo)
  const template = [
    {
      label: 'Nota',
      submenu: [
        { label: 'เกี่ยวกับ Nota', role: 'about' },
        { type: 'separator' },
        { label: 'ออกจากโปรแกรม', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'แก้ไข',
      submenu: [
        { role: 'undo', label: 'เลิกทำ' },
        { role: 'redo', label: 'ทำซ้ำ' },
        { type: 'separator' },
        { role: 'cut', label: 'ตัด' },
        { role: 'copy', label: 'คัดลอก' },
        { role: 'paste', label: 'วาง' },
        { role: 'selectAll', label: 'เลือกทั้งหมด' }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())

// ── IPC handlers ──────────────────────────────────────────

// Open folder dialog — returns { folderPath, name, files[] }
ipcMain.handle('open-folder', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
    title: 'เลือก Folder โน้ต'
  })
  if (result.canceled || !result.filePaths.length) return null
  const folderPath = result.filePaths[0]
  const files = scanFolder(folderPath)
  return { folderPath, name: path.basename(folderPath), files }
})

// Rescan a folder
ipcMain.handle('scan-folder', async (_, folderPath) => {
  return scanFolder(folderPath)
})

// Read file content
ipcMain.handle('read-file', async (_, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch { return '' }
})

// Write file content (auto-save)
ipcMain.handle('write-file', async (_, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return true
  } catch { return false }
})

// Create new file
ipcMain.handle('create-file', async (_, folderPath, filename) => {
  const fullPath = path.join(folderPath, filename)
  if (fs.existsSync(fullPath)) return { error: 'มีไฟล์ชื่อนี้อยู่แล้ว' }
  fs.writeFileSync(fullPath, '', 'utf-8')
  return { filePath: fullPath }
})

// Delete file
ipcMain.handle('delete-file', async (_, filePath) => {
  try {
    fs.unlinkSync(filePath)
    return true
  } catch { return false }
})

// Rename file
ipcMain.handle('rename-file', async (_, oldPath, newName) => {
  const dir = path.dirname(oldPath)
  const newPath = path.join(dir, newName)
  if (fs.existsSync(newPath)) return { error: 'มีไฟล์ชื่อนี้อยู่แล้ว' }
  fs.renameSync(oldPath, newPath)
  return { newPath }
})

// Window controls
ipcMain.on('window-minimize', () => win.minimize())
ipcMain.on('window-maximize', () => win.isMaximized() ? win.unmaximize() : win.maximize())
ipcMain.on('window-close', () => win.close())

// ── Helpers ──────────────────────────────────────────────

function scanFolder(folderPath) {
  const EXTS = ['.md', '.txt']
  const entries = []
  try {
    const items = fs.readdirSync(folderPath, { withFileTypes: true })
    for (const item of items) {
      const ext = path.extname(item.name).toLowerCase()
      if (item.isFile() && EXTS.includes(ext)) {
        const fullPath = path.join(folderPath, item.name)
        const stat = fs.statSync(fullPath)
        entries.push({
          name: item.name,
          path: fullPath,
          ext,
          size: stat.size,
          mtime: stat.mtimeMs
        })
      }
      // subdirectory support (1 level)
      if (item.isDirectory() && !item.name.startsWith('.')) {
        const subPath = path.join(folderPath, item.name)
        const children = []
        try {
          const subItems = fs.readdirSync(subPath, { withFileTypes: true })
          for (const sub of subItems) {
            const subExt = path.extname(sub.name).toLowerCase()
            if (sub.isFile() && EXTS.includes(subExt)) {
              const subFull = path.join(subPath, sub.name)
              const subStat = fs.statSync(subFull)
              children.push({
                name: sub.name,
                path: subFull,
                ext: subExt,
                size: subStat.size,
                mtime: subStat.mtimeMs
              })
            }
          }
        } catch {}
        if (children.length > 0) {
          entries.push({ name: item.name, path: subPath, isDir: true, children })
        }
      }
    }
  } catch {}
  return entries.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? 1 : -1
    return a.name.localeCompare(b.name, 'th')
  })
}
