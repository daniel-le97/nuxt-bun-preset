export default defineSocketHandler(async (server, ws, payload) => {
  // server is the Bun server instance
  // ws is the WebSocket instance
  console.log('server:ws:handler:test', payload)
})
