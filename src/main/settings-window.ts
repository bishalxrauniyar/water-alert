import { BrowserWindow } from 'electron'
import { join } from 'path'
import { rendererUrl } from './renderer-url'

let settingsWindow: BrowserWindow | null = null

export function openSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show()
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 440,
    height: 560,
    show: false,
    resizable: false,
    autoHideMenuBar: true,
    title: 'Water Buddy Settings',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  settingsWindow.on('ready-to-show', () => settingsWindow?.show())
  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  settingsWindow.loadURL(rendererUrl('settings'))
}
