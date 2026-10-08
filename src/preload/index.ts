import { contextBridge, ipcRenderer } from 'electron'
import { AppSettings, BuddyApi, BuddyState, Ipc, ReminderPayload } from '../shared/types'

function subscribe<T>(channel: string, cb: (payload: T, ...rest: unknown[]) => void): () => void {
  const listener = (_event: Electron.IpcRendererEvent, payload: T, ...rest: unknown[]): void =>
    cb(payload, ...rest)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

const api: BuddyApi = {
  drink: () => ipcRenderer.send(Ipc.actionDrink),
  notNow: () => ipcRenderer.send(Ipc.actionNotNow),
  snooze: () => ipcRenderer.send(Ipc.actionSnooze),
  dismiss: () => ipcRenderer.send(Ipc.overlayDismiss),
  previewBuddy: () => ipcRenderer.send(Ipc.overlayPreview),
  getSettings: () => ipcRenderer.invoke(Ipc.settingsGet),
  updateSettings: (patch: Partial<AppSettings>) => ipcRenderer.invoke(Ipc.settingsUpdate, patch),
  onReminder: (cb) => subscribe<ReminderPayload>(Ipc.reminderShow, cb),
  onBuddyState: (cb) =>
    subscribe<BuddyState>(Ipc.buddyState, (state, message) => cb(state, message as string)),
  onSettingsChanged: (cb) => subscribe<AppSettings>(Ipc.settingsChanged, cb)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('buddy', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.buddy = api
}
