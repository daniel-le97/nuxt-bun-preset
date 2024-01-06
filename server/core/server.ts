import type { Server as BunServer } from 'bun'

let _Server: BunServer | null = null

export const setServer = (server: BunServer) => _Server = server
export function Server() {
  if (!_Server)
    throw new Error('Server not set')
  return _Server
}
