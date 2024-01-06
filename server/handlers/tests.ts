import { defineSocketHandler } from '../utils/socketHandler'

// this works but u will need to import everything you need, auto imports do not work
export default defineSocketHandler(async (server, ws, payload) => {
  console.log('server:ws:handler:test', payload)
})
