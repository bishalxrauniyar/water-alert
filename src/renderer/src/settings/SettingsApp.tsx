import { useEffect, useState } from 'react'
import { AppSettings, OverlayPosition } from '@shared/types'

const POSITIONS: { value: OverlayPosition; label: string }[] = [
  { value: 'bottom-right', label: 'Bottom right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'top-left', label: 'Top left' }
]

export function SettingsApp(): React.JSX.Element {
  const [settings, setSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    window.buddy.getSettings().then(setSettings)
    return window.buddy.onSettingsChanged(setSettings)
  }, [])

  const patch = (p: Partial<AppSettings>): void => {
    setSettings((prev) => (prev ? { ...prev, ...p } : prev))
    window.buddy.updateSettings(p)
  }

  if (!settings) {
    return <div className="settings-root loading">Loading…</div>
  }

  return (
    <div className="settings-root">
      <header>
        <h1>💧 Water Buddy</h1>
        <p>A little buddy who reminds you to hydrate.</p>
      </header>

      <section className="section">
        <label className="field">
          <span>Remind me every</span>
          <div className="inline">
            <input
              type="number"
              min={1}
              max={180}
              value={settings.intervalMinutes}
              onChange={(e) =>
                patch({ intervalMinutes: clamp(Number(e.target.value), 1, 180) })
              }
            />
            <em>minutes</em>
          </div>
        </label>

        <label className="field">
          <span>Snooze for</span>
          <div className="inline">
            <input
              type="number"
              min={1}
              max={60}
              value={settings.snoozeMinutes}
              onChange={(e) => patch({ snoozeMinutes: clamp(Number(e.target.value), 1, 60) })}
            />
            <em>minutes</em>
          </div>
        </label>

        <div className="field">
          <span>Buddy appears</span>
          <div className="positions">
            {POSITIONS.map((p) => (
              <button
                key={p.value}
                className={`chip ${settings.position === p.value ? 'chip--on' : ''}`}
                onClick={() => patch({ position: p.value })}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.paused}
            onChange={(e) => patch({ paused: e.target.checked })}
          />
          <span>Pause reminders</span>
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.launchAtLogin}
            onChange={(e) => patch({ launchAtLogin: e.target.checked })}
          />
          <span>Launch at login</span>
        </label>
      </section>

      <section className="section">
        <button
          className="preview"
          onClick={() => window.buddy.previewBuddy()}
          disabled={settings.paused}
        >
          Show my buddy now
        </button>
        <p className="hint">
          {settings.paused
            ? 'Reminders are paused — unpause to see your buddy.'
            : `Next reminder in about ${settings.intervalMinutes} minutes.`}
        </p>
      </section>

      <footer>
        Right-click the tray icon (💧) for quick actions. Quit from the tray menu.
      </footer>
    </div>
  )
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}
