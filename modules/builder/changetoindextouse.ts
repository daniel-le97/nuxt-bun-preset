import { createResolver, defineNuxtModule, useLogger, useNitro } from '@nuxt/kit'
import { builder } from './runtime/build'

export default defineNuxtModule({
  meta: {
    name: 'setup:sockethandlers',
    version: '0.0.1',
  },
  async setup(options, nuxt) {
    const order: string[] = []

    const logger = useLogger('bun')
    logger.box('setup ksdhlkjhasldkfhlksdjhflkajhsdflkjahsldkfjhalksjdhflakjhsdflkjahsdlkfjh')

    nuxt.hooks.beforeEach((event) => {
      const found = order.find(key => key === event.name)
      if (found)
        return
      order.push(`${event.name}`)
    })

    const { resolve } = createResolver(import.meta.url)

    nuxt.hooks.hook('ready', () => {
      const nitro = useNitro()

      nitro.hooks.hook('compiled', async () => {
        await builder(nitro)
      })
      nitro.hooks.beforeEach((event) => {
        const found = order.find(key => key === event.name)
        if (found)
          return
        order.push(`${event.name}`)
      })
    })

    nuxt.hooks.hookOnce('builder:watch', () => {
      const toObject: Record<number, string> = {}
      order.forEach((key, index) => {
        toObject[index] = key
      })
      Bun.write('hello.json', JSON.stringify(toObject))
    })
  },
})
