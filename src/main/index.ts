import { app, ipcMain, powerMonitor, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { AppSettings, Ipc, ReminderPayload } from '../shared/types'
import { SettingsStore } from './store'
import { TimerEngine } from './timer'
import {
  createOverlayWindow,
  hideOverlay,
  sendBuddyState,
  showReminder
} from './overlay'
import { openSettingsWindow } from './settings-window'
import { createTray, setTrayPaused, TrayCallbacks } from './tray'

let store: SettingsStore
let timer: TimerEngine
let trayCallbacks: TrayCallbacks

const THIRSTY_MESSAGES = [
  'Time to drink water! 💧',
  'Hydration break — grab your bottle!',
  'Your body is asking for water 💧',
  'Drink up! Stay hydrated!'
]

function broadcastSettings(): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(Ipc.settingsChanged, store.data)
  }
}

function triggerReminder(): void {
  if (store.data.paused) return
  const message = THIRSTY_MESSAGES[Math.floor(Math.random() * THIRSTY_MESSAGES.length)]
  const payload: ReminderPayload = {
    state: 'thirsty',
    message,
    snoozeLabel: `Remind in ${store.data.snoozeMinutes} min`
  }
  showReminder(payload, store.data.position)
}

function applySettings(patch: Partial<AppSettings>): AppSettings {
  const settings = store.update(patch)
  if ('paused' in patch) timer.setPaused(settings.paused)
  if ('intervalMinutes' in patch && !settings.paused && !('snoozeMinutes' in patch)) {
    timer.reset()
  }
  if ('launchAtLogin' in patch) {
    app.setLoginItemSettings({ openAtLogin: settings.launchAtLogin })
  }
  setTrayPaused(settings.paused, trayCallbacks)
  broadcastSettings()
  return settings
}

function registerIpc(): void {
  ipcMain.handle(Ipc.settingsGet, () => store.data)

  ipcMain.handle(Ipc.settingsUpdate, (_event, patch: Partial<AppSettings>) => applySettings(patch))

  ipcMain.on(Ipc.actionDrink, () => {
    store.logDrink()
    sendBuddyState('cheer', 'Ahhh… refreshing! 😌')
    setTimeout(() => {
      hideOverlay()
      timer.reset()
    }, 2400)
  })

  ipcMain.on(Ipc.actionNotNow, () => {
    hideOverlay()
    timer.reset()
  })

  ipcMain.on(Ipc.actionSnooze, () => {
    hideOverlay()
    timer.snooze()
  })

  ipcMain.on(Ipc.overlayDismiss, () => {
    hideOverlay()
  })

  ipcMain.on(Ipc.overlayPreview, () => {
    showReminder({
      state: 'idle',
      message: 'This is how I will remind you 💧',
      snoozeLabel: `Remind in ${store.data.snoozeMinutes} min`
    }, store.data.position)
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.bishalx.waterbuddy')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  store = new SettingsStore()
  timer = new TimerEngine(
    () => store.data.intervalMinutes * 60_000,
    () => store.data.snoozeMinutes * 60_000
  )
  timer.on('trigger', triggerReminder)
  timer.setPaused(store.data.paused)

  trayCallbacks = {
    onPreview: () => triggerReminder(),
    onTogglePause: (paused) => applySettings({ paused }),
    onOpenSettings: () => openSettingsWindow(),
    onQuit: () => app.quit()
  }

  createOverlayWindow()
  createTray(trayCallbacks)
  registerIpc()
  timer.start()

  powerMonitor.on('resume', () => timer.recheck())
  powerMonitor.on('unlock-screen', () => timer.recheck())

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) openSettingsWindow()
  })
})

app.on('window-all-closed', () => {
  // Tray-resident app: keep running in background on all platforms.
  // User quits via tray menu or Cmd+Q.
})
