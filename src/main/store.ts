import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'fs'
import { join } from 'path'
import { AppSettings, DEFAULT_SETTINGS, DrinkRecord } from '../shared/types'

export class SettingsStore {
  private file: string
  private logFile: string
  data: AppSettings

  constructor() {
    const dir = app.getPath('userData')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    this.file = join(dir, 'settings.json')
    this.logFile = join(dir, 'drinks.jsonl')
    this.data = this.read()
  }

  private read(): AppSettings {
    try {
      const raw = JSON.parse(readFileSync(this.file, 'utf8'))
      return { ...DEFAULT_SETTINGS, ...raw }
    } catch {
      return { ...DEFAULT_SETTINGS }
    }
  }

  update(patch: Partial<AppSettings>): AppSettings {
    this.data = { ...this.data, ...patch }
    writeFileSync(this.file, JSON.stringify(this.data, null, 2))
    return this.data
  }

  logDrink(): void {
    const record: DrinkRecord = { at: new Date().toISOString() }
    try {
      appendFileSync(this.logFile, JSON.stringify(record) + '\n')
    } catch (error) {
      console.error('Failed to log drink', error)
    }
  }

  drinksToday(): number {
    try {
      const today = new Date().toDateString()
      return readFileSync(this.logFile, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line) as DrinkRecord)
        .filter((r) => new Date(r.at).toDateString() === today).length
    } catch {
      return 0
    }
  }
}
