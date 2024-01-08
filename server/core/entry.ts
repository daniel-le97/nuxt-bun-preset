import '#internal/nitro/virtual/polyfill'
import { websocket } from './websocket'
import { setServer } from './server'

// @ts-expect-error it is there
import { runNitroTask } from '#internal/nitro/task'

// @ts-expect-error it is there
import { tasks } from '#internal/nitro/virtual/tasks'

const nitroApp = useNitroApp()
// @ts-expect-error it is there
const handler = toWebHandler(nitroApp.h3App)

nitroApp.router.get(
  '/_nitro/tasks',
  // @ts-expect-error type import errors
  defineEventHandler((event) => {
    return {
      tasks: Object.fromEntries(
        Object.entries(tasks).map(([name, task]) => [
          name,
          // @ts-expect-error type import errors
          { description: task.description },
        ]),
      ),
    }
  },
  ),
)
nitroApp.router.use(
  '/_nitro/tasks/:name',
  // @ts-expect-error type import errors
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, 'name')
    const payload = {
      ...getQuery(event),
      ...(await readBody(event).catch(() => ({}))),
    }
    return await runNitroTask(name, payload)
  },
  ),
)

const server = Bun.serve({
  port: process.env.NITRO_PORT || process.env.PORT || 3000,
  async fetch(req, server) {
    try {
      return await handler(req, { server, request: req })
    }
    catch (error) {
      console.error(req.url, error)
    }
  },
  websocket,
})
setServer(server)
// @ts-expect-error calling it here, unable to update hook type
nitroApp.hooks.callHook('server', server)

console.log(`Listening on http://localhost:${server.port}...`)
