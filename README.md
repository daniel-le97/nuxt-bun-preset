# Nuxt 3 Bun websocket chat

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## notice
this project tries to use everything bun can provide so bun:sqlite is used and bun hashing for passwords

the custom preset can be found in [core](./server/core)

an extra nitro hook is added in this preset
```javascript
import {type Server} from 'bun'
export default defineNitroPlugin(nitroApp => {
    // this will not be typed currently
    nitroApp.hooks.hook('server', (server: Server) => {
        // do something with the bun server
    })
})
```

## Setup

Make sure to install the dependencies:

```bash
# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# bun
bun run dev
```

## Production

Build the application for production:

```bash
# bun
bun run build
```

run production build:

```bash
# bun
bun run start
```

## Deployment
a dockerfile has been provided for ease of deployments!

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
