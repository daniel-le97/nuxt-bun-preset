import type { Server } from 'bun'

declare module 'h3' {
  interface H3EventContext {
    server: Server
    request: Request
  }
}
