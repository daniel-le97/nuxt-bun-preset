<script setup lang="ts">
console.log('index.vue')

definePageMeta({
  auth: true,
})
useHead({
  title: 'Home Page',
})

const { session } = useAuth()
const fakeMessages = ref()

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

const sendMsg = ref<{ send: (message: string) => void, unsubscribe: () => void }>()
type ws<T = any> = ReturnType<typeof useWebSocket<T>>
const socket = ref<ws>()
const interval = ref<ReturnType<typeof setInterval>>()
const port = ref(3000)

onMounted(async () => {
  const vis = useDocumentVisibility()
  // const location = useGeolocation()

  // if (location.isSupported.value)
  //   console.log('location', location.isSupported.value)

  // const latitude = location.coords.value.latitude
  // const longitude = location.coords.value.longitude
  // // Construct the Nominatim API URL
  // const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
  // const fetched = await $fetch(apiUrl)
  // console.log('fetched', fetched)

  if (process.env.NODE_ENV !== 'production') {
    const _port = await $fetch('/api/server') as number
    port.value = _port
  }
  const url = `ws://localhost:${port.value}/ws`
  socket.value = useWebSocket(url, {
    onConnected(ws) {
      interval.value = setInterval(() => {
        ws.send(JSON.stringify({ type: 'heartbeat', data: { message: vis.value } }))
      }, 5000)
    },
    onMessage(ws, _event) {
      console.log('onMessage', _event.data)
      if (!_event.data)
        return

      if (String(_event.data) === 'pong') {
        // console.log('pong', _event.data)
        return
      }

      const event = StringToWebSocketSchema(_event.data as unknown as string)
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
        useToast().add({ title: `${event.type}:${event.data.channel}`, description: JSON.stringify(event) })
        data.value?.messages.push(formatted)
      }
      if (event.type === 'subscribe') {
        const user = event.data.auth as User
        const found = data.value?.users.find(i => i.id === user.id)
        if (found)
          return
        data.value?.users.push(user)
      }
      if (event.type === 'unsubscribe' && data.value?.users) {
        const user = event.data.auth as User
        data.value.users = data.value?.users.filter(i => i.id !== user.id)
      }
    },
    onDisconnected(ws) {
      clearInterval(interval.value)
      console.log('onDisconnected')
    },
  })

  socket.value.send(WebSocketSchemaToString({ type: 'subscribe', data: { channel: `channel:${channel.value.id}` } }))
})

onUnmounted(() => {
  clearInterval(interval.value)
  socket.value?.close?.()
})

async function nextChanel(_channel: { id: number, title: string }) {
  channel.value = _channel
  const newData = await $fetch<{ messages: MessageSchema[], users: User[] }>(`/api/channels?channel=${_channel.id}`)
  data.value = newData
  // sendMsg.value = sub
}

const regex = /^\s*$/g

function isValidString(input: string) {
  return !regex.test(input)
}

function handleKeyPress(e: any) {
  e.preventDefault()
  if (e.key === 'Enter')
    click()
}

function click() {
  if (!isValidString(newMessage.value))
    return

  console.log('click', newMessage.value)

  socket.value?.send?.(WebSocketSchemaToString({ type: 'publish', data: { channel: `channel:${channel.value.id}`, message: newMessage.value } }))
  // sendMsg.value?.send?.(newMessage.value)
  // newMessage.value = ''
}
</script>

<template>
  <main class="text-lg">
    <div v-if="session?.id" class="flex    min-h-screen ">
      <div class=" w-1/4 bg-gray-800 py-5">
        <div class="text-2xl font-extrabold mb-4 px-3 text-emerald-200 underline underline-offset-4">
          Chat Rooms
        </div>
        <div class="p-2 flex flex-col gap-4 ">
          <button v-for="i in chatRooms" :key="i.id" variant="link" class=" text-xl text-emerald-400" @click="nextChanel(i)">
            {{ i.title }}
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
          <textarea v-model="newMessage" type="text" class="w-full rounded-lg p-2" @keyup="handleKeyPress" />

          <button size="xl" class=" mt-2 absolute right-10 top-3.5" type="button" @click="click">
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
