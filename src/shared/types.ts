export type OverlayPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export type BuddyState = 'thirsty' | 'cheer' | 'sad' | 'idle'

export interface AppSettings {
  intervalMinutes: number
  snoozeMinutes: number
  paused: boolean
  launchAtLogin: boolean
  position: OverlayPosition
}

export interface ReminderPayload {
  state: BuddyState
  message: string
  snoozeLabel: string
}

export interface DrinkRecord {
  at: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  intervalMinutes: 30,
  snoozeMinutes: 5,
  paused: false,
  launchAtLogin: false,
  position: 'bottom-right'
}

export const Ipc = {
  actionDrink: 'action:drink',
  actionNotNow: 'action:not-now',
  actionSnooze: 'action:snooze',
  overlayDismiss: 'overlay:dismiss',
  overlayPreview: 'overlay:preview',
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',
  settingsChanged: 'settings:changed',
  reminderShow: 'reminder:show',
  buddyState: 'buddy:state'
} as const

export interface BuddyApi {
  drink(): void
  notNow(): void
  snooze(): void
  dismiss(): void
  previewBuddy(): void
  getSettings(): Promise<AppSettings>
  updateSettings(patch: Partial<AppSettings>): Promise<AppSettings>
  onReminder(cb: (payload: ReminderPayload) => void): () => void
  onBuddyState(cb: (state: BuddyState, message: string) => void): () => void
  onSettingsChanged(cb: (settings: AppSettings) => void): () => void
}
