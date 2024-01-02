<script setup lang="ts">
useHead({
  title: 'Home Page',
})

const { session } = useAuth()
const fakeMessages = ref()

interface Message {
  channel: string
  auth: {
    id: string
    name: string
    email?: string
    image?: string
  }
  message: string
  createdAt: string
}
const { data: messages } = useFetch<Message[]>('/api/channels/1')

const newMessage = ref('')

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

function handleEvent(event: wsChannelEvents) {
  console.log(event)
}
const sendMsg = ref<{ send: (message: string) => void, unsubscribe: () => void }>()
onMounted(() => {
  const sub = useSubscribe(`channel:${1}`, handleEvent)
  sendMsg.value = sub
})

function nextChanel(id: string) {
  sendMsg.value?.unsubscribe?.()
  const sub = useSubscribe(`channel:${id}`, handleEvent)
  sendMsg.value = sub
}

function click() {
  sendMsg.value?.send?.(newMessage.value)
  newMessage.value = ''
}
</script>

<template>
  <main class="text-lg">
    <!-- Welcome to the example of <span class="text-primary">Nuxt</span> with <span class="text-orange-400">Local Authentication.</span> -->

    <div v-if="session?.id" class="flex    min-h-screen ">
      <div class=" w-1/4 bg-gray-800 py-5">
        <div class="text-2xl font-extrabold mb-4 px-3 text-emerald-200 underline underline-offset-4">
          Chat Rooms
        </div>
        <div class="p-2 flex flex-col gap-4 ">
          <UButton v-for="i in chatRooms" :key="i.id" variant="link" class=" text-xl text-emerald-400">
            {{ i.title }}
          </UButton>
        </div>
      </div>
      <div class="w-5/6 flex flex-col items-center justify-center gap-2">
        <!-- MESSAGE CONTAINER -->
        <div class="w-full h-full  overflow-y-scroll py-4 px-2 space-y-5">
          <MessageCard v-for="message in messages" :key="message.channel" :user-avatar="message.auth.image" :user-id="message.auth.id" :created-at="message.createdAt" :message="message.message" />
        </div>
        <!-- MESSAGE CONTAINER END -->

        <div class="p-2 w-full relative">
          <UTextarea v-model:modelValue="newMessage" type="text" class="w-full " />

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
