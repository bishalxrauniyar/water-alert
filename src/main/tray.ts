import { Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'

export interface TrayCallbacks {
  onPreview(): void
  onTogglePause(paused: boolean): void
  onOpenSettings(): void
  onQuit(): void
}

let tray: Tray | null = null
let paused = false

export function createTray(callbacks: TrayCallbacks): Tray {
  const iconPath = join(
    __dirname,
    process.platform === 'darwin' ? '../../resources/trayTemplate.png' : '../../resources/tray.png'
  )
  const image = nativeImage.createFromPath(iconPath)
  if (process.platform === 'darwin') image.setTemplateImage(true)

  tray = new Tray(image)
  tray.setToolTip('Water Buddy')
  rebuildMenu(callbacks)
  tray.on('click', () => callbacks.onPreview())
  return tray
}

export function setTrayPaused(value: boolean, callbacks: TrayCallbacks): void {
  paused = value
  rebuildMenu(callbacks)
}

function rebuildMenu(callbacks: TrayCallbacks): void {
  const menu = Menu.buildFromTemplate([
    { label: 'Show reminder now', click: () => callbacks.onPreview() },
    {
      label: 'Pause reminders',
      type: 'checkbox',
      checked: paused,
      click: () => callbacks.onTogglePause(!paused)
    },
    { type: 'separator' },
    { label: 'Settings…', click: () => callbacks.onOpenSettings() },
    { type: 'separator' },
    { label: 'Quit Water Buddy', click: () => callbacks.onQuit() }
  ])
  tray?.setContextMenu(menu)
}
