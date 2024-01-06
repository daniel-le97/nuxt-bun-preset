// import {} from "nuxt/kit"
export default defineNitroModule({
    'name': 'test',
    setup(nitro) {
    
        nitro.vfs = nitro.vfs || {}
        nitro.vfs.test = 'test'
        
        // nitro.options.virtual
        // console.log('nitro:modules:test', nitro.options.virtual)

    },
})
