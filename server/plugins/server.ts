export default defineNitroPlugin((nitroApp) => {

    // @ts-expect-error it is assigned in preset/entry.dev.ts
    nitroApp.hooks.hook('server', (server) => {
        // console.log('server', server)
    })
})
