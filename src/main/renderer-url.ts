import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export function rendererUrl(page: 'overlay' | 'settings'): string {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    return `${process.env['ELECTRON_RENDERER_URL']}/${page}/index.html`
  }
  return join(__dirname, `../renderer/${page}/index.html`)
}
