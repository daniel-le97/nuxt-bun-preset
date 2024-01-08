<script setup lang="ts">
definePageMeta({
  auth: true,
})
useHead({
  title: 'Home Page',
})

const channel = ref({ id: 1, title: 'General Chat' })
const { data, refresh } = useFetch<{ messages: MessageSchema[], users: User[] }>(`/api/channels`, {
  query: { channel: channel.value.id },
})
// console.log('messages', messages.value)
const auth = useAuth()
const newMessage = ref(auth.session.value?.name ?? '')

// In script setup
const chatRooms = ref([
  { id: 1, title: 'General Chat' },
  { id: 2, title: 'Tech Talk' },
  { id: 3, title: 'Foodies Corner' },
  { id: 4, title: 'Music Lovers' },
  { id: 5, title: 'Fitness Enthusiasts' },
  { id: 6, title: 'Book Club' },
  { id: 7, title: 'Gaming Zone' },
  { id: 8, title: 'Travel Explorers' },
  { id: 9, title: 'Art and Design Hub' },
  { id: 10, title: 'Movie Buffs' },
])

type ws<T = any> = ReturnType<typeof useWebSocket<T>>
const socket = ref<ws>()
const sendMessage = (message: WebSocketSchema) => socket.value?.send?.(WebSocketSchemaToString(message))
const interval = ref<ReturnType<typeof setInterval>>()
const typer = ref<User | null>()

watch(typer, (val) => {
  if (!val?.name)
    return

  setTimeout(() => {
    typer.value = null
  }, 2000)
})

onMounted(async () => {
  const _port = import.meta.dev ? await $fetch('/api/server') as number : (process.env.PORT || process.env.NITRO_PORT || 3000)
  const url = `ws://localhost:${Number(_port)}`
  socket.value = useWebSocket(url, {
    onConnected(ws) {
      subscribe()
      // const vis = useDocumentVisibility()
      // interval.value = setInterval(() => {
      //   ws.send(JSON.stringify({ type: 'heartbeat', data: { message: vis.value } }))
      // }, 5000)
    },
    onMessage(ws, _event) {
      // console.log('client:ws:message', _event.data)
      if (!_event.data)
        return

      // if (String(_event.data) === 'pong') {
      //   // console.log('pong', _event.data)
      //   return
      // }

      const event = StringToWebSocketSchema(_event.data as unknown as string)
      if (event.type === 'typing') {
        typer.value = event.data.auth as User
        return
      }
      if (event.type === 'publish') {
        const message = event.data
        const formatted: MessageSchema = {
          id: Number(message.id),
          userId: message.auth!.id!,
          message: message.message!,
          image: message.auth!.image!,
          createdAt: message.createdAt!,
          channel: message.channel!,
          name: message.auth!.name!,
        }
        data.value?.messages.push(formatted)
        if (formatted.userId !== auth.session.value?.id) {
          const channelId = formatted.channel.split(':')[1]
          const found = chatRooms.value.find(i => i.id === Number(channelId))
          useToast().add({ title: `${found?.title}`, description: formatted.message })
        }
      }
      if (event.type === 'subscribe') {
        const user = event.data.auth as User
        const found = data.value?.users.find(i => i.id === user.id)
        if (found || user.id === auth.session.value?.id)
          return

        if (user.name)
          useToast().add({ title: `${user.name} joined the channel` })

        data.value?.users.push(user)
      }
      if (event.type === 'unsubscribe' && data.value?.users) {
        const user = event.data.auth as User

        if (user.id === auth.session.value?.id)
          return

        const found = data.value?.users.find(i => i.id === user.id)
        if (!found)
          return

        useToast().add({ title: `${found.name} left the channel` })
        data.value.users = data.value?.users.filter(i => i.id !== user.id)
      }
    },
    onDisconnected(ws) {
      clearInterval(interval.value)
      console.log('onDisconnected')
    },
  })

  sendMessage({ type: 'subscribe', data: { channel: `channel:${channel.value.id}` } })
})

onUnmounted(() => {
  clearInterval(interval.value)
  socket.value?.close?.()
})

function subscribe() {
  sendMessage({ type: 'subscribe', data: { channel: `channel:${channel.value.id}` } })
  // socket.value?.send?.(WebSocketSchemaToString({ type: 'subscribe', data: { channel: `channel:${channel.value.id}` } }))
}
function unsubscribe() {
  sendMessage({ type: 'unsubscribe', data: { channel: `channel:${channel.value.id}` } })
  // socket.value?.send?.(WebSocketSchemaToString({ type: 'unsubscribe', data: { channel: `channel:${channel.value.id}` } }))
}

async function nextChanel(_channel: { id: number, title: string }) {
  if (channel.value.id === _channel.id)
    return

  unsubscribe()
  channel.value = _channel
  subscribe()

  const newData = await $fetch<{ messages: MessageSchema[], users: User[] }>(`/api/channels?channel=${_channel.id}`)
  data.value = newData
  // sendMsg.value = sub
}

const regex = /^\s*$/g

function isValidString(input: string) {
  return !regex.test(input)
}

const debounced = useDebounceFn(() => {
  if (!isValidString(newMessage.value))
    return

  // console.log('typing', newMessage.value)
  sendMessage({ type: 'typing', data: { channel: `channel:${channel.value.id}`, message: newMessage.value } })
}, 2000)
function handleKeyPress(e: any) {
  e.preventDefault()
  if (e.key === 'Enter')
    click()

  else
    debounced()
}

function click() {
  if (!isValidString(newMessage.value))
    return

  // socket.value?.send?.(WebSocketSchemaToString({ type: 'tests', data: { channel: `channel:${channel.value.id}`, message: newMessage.value } }))

  sendMessage({ type: 'publish', data: { channel: `channel:${channel.value.id}`, message: newMessage.value } })
  // socket.value?.send?.(WebSocketSchemaToString({ type: 'publish', data: { channel: `channel:${channel.value.id}`, message: newMessage.value } }))
}
</script>

<template>
  <main class="text-lg">
    <div v-if="auth.loggedIn" class="flex  min-h-screen ">
      <div class=" w-1/4 bg-gray-800 py-5">
        <div class="flex justify-center align-middle pb-3">
          <ProfileNavigation />
        </div>
        <div class=" flex justify-center text-2xl font-extrabold mb-4 px-3 text-emerald-200 underline underline-offset-4">
          Chat Rooms
        </div>
        <div class="p-2 flex flex-col gap-4 ">
          <button v-for="i in chatRooms" :key="i.id" variant="link" class=" text-xl text-emerald-400" @click="nextChanel(i)">
            <p v-if="channel.id === i.id" class="bg-white rounded">
              {{ i.title }}
            </p>
            <p v-else>
              {{ i.title }}
            </p>
          </button>
        </div>
      </div>
      <div class="w-5/6 flex flex-col items-center justify-center gap-2">
        <!-- MESSAGE CONTAINER -->
        <div class="w-full h-[85vh]  overflow-y-scroll py-4 px-2 space-y-5">
          <div class="flex justify-center align-middle bg-primary rounded-md">
            {{ channel.title }}
          </div>
          <UAvatarGroup v-if="data?.users.length! >= 1" size="sm" :max="3" class="flex justify-center">
            <UAvatar
              v-for="user in data?.users"
              :key="user.id"
              :src="user.image"
              :alt="user.name"
              :title="user.name"
            />
          </UAvatarGroup>
          <div v-if="data?.messages?.length! >= 1">
            <ClientOnly>
              <MessageCard v-for="message in data?.messages" :key="message.id" :user-avatar="message.image" :user-id="message.userId" :created-at="message.createdAt" :message="message.message" />
            </ClientOnly>
          </div>
        </div>
        <!-- MESSAGE CONTAINER END -->

        <div class="p-2 w-full relative">
          <div v-if="typer?.name" class=" text-sm">
            {{ typer?.name }} is typing...
          </div>
          <textarea v-model="newMessage" type="text" class="w-full rounded-lg p-2" @keyup="handleKeyPress" />

          <button size="xl" class=" mt-2 absolute right-10 top-4.5" type="button" @click="click">
            Send
          </button>
        </div>
      </div>
    </div>
    <div v-else class=" text-8xl flex items-center justify-center font-extrabold">
      SIGN IN TO VIEW CHAT AND ROOMS
    </div>
  </main>
</template>
