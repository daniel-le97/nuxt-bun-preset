import '#internal/nitro/virtual/polyfill'
import { Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { parentPort, threadId } from 'node:worker_threads'
import { isWindows, provider } from 'std-env'
import {
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
  toNodeListener,
} from 'h3'

// @ts-expect-error it is there
import { trapUnhandledNodeErrors } from '#internal/nitro/utils'

// @ts-expect-error it is there
import { runNitroTask } from '#internal/nitro/task'

// @ts-expect-error it is there
import { tasks } from '#internal/nitro/virtual/tasks'

const nitroApp = useNitroApp()
// @ts-expect-error H3App is App
const server = new Server(toNodeListener(nitroApp.h3App))

function getAddress() {
  if (
    provider === 'stackblitz'
    || process.env.NITRO_NO_UNIX_SOCKET
    || process.versions.bun
  )
    return 0

  const socketName = `worker-${process.pid}-${threadId}.sock`
  if (isWindows) {
    return join('\\\\.\\pipe\\nitro', socketName)
  }
  else {
    const socketDir = join(tmpdir(), 'nitro')
    mkdirSync(socketDir, { recursive: true })
    return join(socketDir, socketName)
  }
}

const listenAddress = getAddress()
const listener = server.listen(listenAddress, () => {
  const _address = server.address()
  console.log('listening on', _address)

  parentPort?.postMessage({
    event: 'listen',
    address:
      typeof _address === 'string'
        ? { socketPath: _address }
        : { host: 'localhost', port: _address?.port },
  })
})

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

// Trap unhandled errors
trapUnhandledNodeErrors()

// Graceful shutdown
async function onShutdown(signal?: NodeJS.Signals) {
  await nitroApp.hooks.callHook('close')
}

parentPort?.on('message', async (msg) => {
  if (msg && msg.event === 'shutdown') {
    await onShutdown()
    parentPort?.postMessage({ event: 'exit' })
  }
})
