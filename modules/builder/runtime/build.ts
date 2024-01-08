import { Glob } from 'node:bun'
import type { Nitro } from 'nitropack'

export async function builder(nitro: Nitro) {
  const files: string[] = []
  const glob = new Glob('*.ts')
  const dir = `${process.cwd()}/server/handlers`
  for await (const file of glob.scan(dir))
    files.push(`${dir}/${file}`)

  const _outdir = () => {
    if (process.env.NODE_ENV === 'production')
      return `${nitro.options.output.serverDir}/handlers`

    return `${nitro.options.buildDir}/handlers`
  }
  const outdir = _outdir()

  const build = await Bun.build({
    entrypoints: files,
    outdir,
    splitting: true,
    naming: {
      chunk: 'chunks/[name]-[hash]',
    },
    plugins: [{
      name: 'test',
      target: 'bun',
      setup(build) {
        build.onLoad({ filter: /\.ts$/ }, async ({ path }) => {
          const contents = await Bun.file(path).text()
          const transformed = await nitro.unimport?.injectImports(contents)
          return {
            contents: transformed?.code || contents,
          }
        })
      },
    }],
  })
}
