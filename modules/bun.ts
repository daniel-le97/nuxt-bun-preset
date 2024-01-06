import { addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'


export default defineNuxtModule({
  meta: {
    name: 'bun',
    version: '0.0.1',
  },
  async setup(options, nuxt) {
    console.log('nuxt:modules:setup')
    const { resolve } = createResolver(import.meta.url)

    
   
    const dir = nuxt.options.srcDir
    const resolvedDir = resolve(dir, 'server/handlers')
    console.log('dir', dir)

    const extGlob = '*.ts'
    const files: string[] = []
    // async function scanHandlers() {
    //   const glob = new Glob(extGlob)
    //   for await (const gl of glob.scan(resolvedDir)) {
    //     files.push(gl)
    //     console.log(gl)
    //   }

    //   return files
    // }

    // await scanHandlers()
    // addTemplate({
    //   filename: 'socket-handlers.ts',
    //   write: true,
    //   getContents() {
    //     return `
    //         import { defineSocketHandler} from '${dir}/server/utils/socketHandler';
    //         ${files.map((file, index) => `import function${index} from '${resolvedDir}/${file.replace('.ts', '')}'`).join('\n')}
    //         export {
    //             ${files.map((_, index) => `function${index}`).join(',\n')}
    //         }
    //       `
    //   },
    // })
  },
})
