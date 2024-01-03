<script setup lang="ts">
import type { NewMessage } from '../server/utils/message'

definePageMeta({
  auth: true,
})
useHead({
  title: 'Home Page',
})

const { session } = useAuth()
const fakeMessages = ref()

const channel = ref({ id: 1, title: 'General Chat' })
const { data: messages, refresh } = useFetch<NewMessage[]>(`/api/channels`, {
  query: { channel: channel.value.id },
})
// console.log('messages', messages.value)

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
  // console.log('handleEvent', event.data)
  const message = event.data as NewMessage
  messages.value?.push(message)
}
const sendMsg = ref<{ send: (message: string) => void, unsubscribe: () => void }>()
onMounted(() => {
  const sub = useSubscribe(`channel:${channel.value.id}`, handleEvent)
  sendMsg.value = sub
})

async function nextChanel(data: { id: number, title: string }) {
  channel.value = data
  sendMsg.value?.unsubscribe?.()
  await refresh()
  const sub = useSubscribe(`channel:${data.id}`, handleEvent)
  sendMsg.value = sub
}

const regex = /^\s*$/g

function isValidString(input: string) {
  return !regex.test(input)
}

function click() {
  if (!isValidString(newMessage.value))
    return
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
          <UAvatarGroup size="sm" :max="2" class="flex justify-center">
            <UAvatar
              src="https://avatars.githubusercontent.com/u/739984?v=4"
              alt="benjamincanac"
            />
            <UAvatar
              src="https://avatars.githubusercontent.com/u/904724?v=4"
              alt="Atinux"
            />
            <UAvatar
              src="https://avatars.githubusercontent.com/u/7547335?v=4"
              alt="smarroufin"
            />
          </UAvatarGroup>
          <div v-if="messages?.length! > 1">
            <MessageCard v-for="message in messages" :key="message.id" :user-avatar="message.image" :user-id="message.userId" :created-at="message.createdAt" :message="message.message" />
          </div>
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
