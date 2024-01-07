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
      logger.box(`nuxt:hooks-${event.name}`)
    })

    const resolve = createResolver(import.meta.url)

    nuxt.hooks.hook('ready', () => {
      const nitro = useNitro()

      nitro.hooks.hook('compiled', async () => {
        await builder(nitro)
      })
      nitro.hooks.hook('rollup:before', (nitro, config) => {
        console.log('config', config)
      })
      nitro.hooks.beforeEach((event) => {
        const found = order.find(key => key === event.name)
        if (found)
          return
        order.push(`${event.name}`)
        logger.box(`nitro:hooks-${event.name}`)
      })

      nitro.hooks.hookOnce('compiled', () => {
        const toObject: Record<number, string> = {}
        order.forEach((key, index) => {
          toObject[index] = key
        })
        Bun.write('hello.json', JSON.stringify(toObject))
      })
    })
  },
})
