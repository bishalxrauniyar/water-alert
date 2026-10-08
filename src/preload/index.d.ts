import { BuddyApi } from '../shared/types'

declare global {
  interface Window {
    buddy: BuddyApi
  }
}

export {}
