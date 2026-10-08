import { useEffect, useState } from 'react'
import { BuddyState, ReminderPayload } from '@shared/types'
import { Buddy } from './Buddy'

export function OverlayApp(): React.JSX.Element | null {
  const [reminder, setReminder] = useState<ReminderPayload | null>(null)
  const [buddyState, setBuddyState] = useState<BuddyState>('idle')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const offReminder = window.buddy.onReminder((payload) => {
      setReminder(payload)
      setBuddyState(payload.state)
      setBusy(false)
    })
    const offState = window.buddy.onBuddyState((state, message) => {
      setBuddyState(state)
      setReminder((prev) => (prev ? { ...prev, message } : prev))
      if (state === 'cheer') setBusy(true)
    })
    return () => {
      offReminder()
      offState()
    }
  }, [])

  if (!reminder) return null

  const handleDrink = (): void => {
    setBusy(true)
    window.buddy.drink()
  }

  const handleNotNow = (): void => {
    setBuddyState('sad')
    setReminder((prev) => (prev ? { ...prev, message: 'Okay, see you next time…' } : prev))
    setTimeout(() => window.buddy.notNow(), 900)
  }

  const handleSnooze = (): void => {
    setBuddyState('sad')
    setReminder((prev) =>
      prev ? { ...prev, message: `Alright… poking you again in a bit ⏱️` } : prev
    )
    setTimeout(() => window.buddy.snooze(), 900)
  }

  return (
    <div className="overlay-root">
      <div className={`card card--${buddyState}`}>
        <button className="close" onClick={() => window.buddy.dismiss()} title="Close">
          ×
        </button>

        <div className="bubble">{reminder.message}</div>

        <Buddy state={buddyState} />

        <div className="actions">
          <button className="btn btn-primary" onClick={handleDrink} disabled={busy}>
            Drink water 💧
          </button>
          <div className="actions-row">
            <button className="btn btn-ghost" onClick={handleNotNow} disabled={busy}>
              Not now
            </button>
            <button className="btn btn-ghost" onClick={handleSnooze} disabled={busy}>
              {reminder.snoozeLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
