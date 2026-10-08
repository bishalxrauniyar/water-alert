import { BuddyState } from '@shared/types'

interface BuddyProps {
  state: BuddyState
}

export function Buddy({ state }: BuddyProps): React.JSX.Element {
  return (
    <div className={`buddy buddy--${state}`} aria-hidden="true">
      {state === 'thirsty' && <span className="fx fx-sweat">💧</span>}
      {state === 'cheer' && (
        <>
          <span className="fx fx-sparkle s1">✨</span>
          <span className="fx fx-sparkle s2">✨</span>
        </>
      )}
      {state === 'sad' && <span className="fx fx-zzz">💤</span>}

      <div className="blob">
        <div className="eyes">
          <span className="eye" />
          <span className="eye" />
        </div>
        <span className="mouth" />
        <span className="cheek cheek-l" />
        <span className="cheek cheek-r" />
      </div>

      <div className="bottle" title="water bottle">
        🧴
      </div>
    </div>
  )
}
