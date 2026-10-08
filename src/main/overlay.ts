import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { OverlayPosition, ReminderPayload } from '../shared/types'
import { rendererUrl } from './renderer-url'

const WIDTH = 340
const HEIGHT = 430
const MARGIN = 20

let overlayWindow: BrowserWindow | null = null

function boundsFor(position: OverlayPosition): { x: number; y: number } {
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  const wa = display.workArea
  const x =
    position.endsWith('right') ? wa.x + wa.width - WIDTH - MARGIN : wa.x + MARGIN
  const y = position.endsWith('bottom') ? wa.y + wa.height - HEIGHT - MARGIN : wa.y + MARGIN
  return { x, y }
}

export function createOverlayWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false
    }
  })

  win.setAlwaysOnTop(true, 'screen-saver')
  if (process.platform === 'darwin') {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }

  win.loadURL(rendererUrl('overlay'))
  overlayWindow = win
  return win
}

export function showReminder(payload: ReminderPayload, position: OverlayPosition): void {
  if (!overlayWindow || overlayWindow.isDestroyed()) return
  overlayWindow.setBounds({ ...boundsFor(position), width: WIDTH, height: HEIGHT })
  overlayWindow.webContents.send('reminder:show', payload)
  overlayWindow.show()
  overlayWindow.moveTop()
}

export function sendBuddyState(state: ReminderPayload['state'], message: string): void {
  overlayWindow?.webContents.send('buddy:state', state, message)
}

export function hideOverlay(): void {
  overlayWindow?.hide()
}

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow
}
