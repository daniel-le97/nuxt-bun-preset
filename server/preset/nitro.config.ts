import { fileURLToPath } from 'node:url'
import type { NitroPreset } from 'nitropack'

export default <NitroPreset>{
  extends: 'node', // You can extend existing presets
  entry: fileURLToPath(new URL('./entry.ts', import.meta.url)),
  exportConditions: ['bun', 'worker', 'node', 'import', 'default'],
  serveStatic: true,
  commands: {
    preview: 'bun ./server/index.mjs',
  },
}
