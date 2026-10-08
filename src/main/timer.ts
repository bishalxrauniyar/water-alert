import { EventEmitter } from 'events'

export class TimerEngine extends EventEmitter {
  private deadline = 0
  private handle: NodeJS.Timeout | null = null
  private enabled = true

  constructor(
    private readonly getIntervalMs: () => number,
    private readonly getSnoozeMs: () => number
  ) {
    super()
  }

  start(): void {
    this.reset()
  }

  reset(ms: number = this.getIntervalMs()): void {
    this.deadline = Date.now() + ms
    this.arm()
  }

  snooze(): void {
    this.reset(this.getSnoozeMs())
  }

  pause(): void {
    this.enabled = false
    this.disarm()
  }

  resume(): void {
    this.enabled = true
    this.recheck()
  }

  setPaused(paused: boolean): void {
    if (paused) this.pause()
    else this.resume()
  }

  recheck(): void {
    if (!this.enabled) return
    if (Date.now() >= this.deadline) this.fire()
    else this.arm()
  }

  get remainingMs(): number {
    return Math.max(this.deadline - Date.now(), 0)
  }

  private arm(): void {
    this.disarm()
    if (!this.enabled) return
    const delay = Math.min(Math.max(this.deadline - Date.now(), 500), 2 ** 31 - 1)
    this.handle = setTimeout(() => this.recheck(), delay)
  }

  private disarm(): void {
    if (this.handle) {
      clearTimeout(this.handle)
      this.handle = null
    }
  }

  private fire(): void {
    this.emit('trigger')
    this.reset()
  }
}
