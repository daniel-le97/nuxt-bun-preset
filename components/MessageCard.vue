<script setup>
// Props
const { userAvatar, userId, message, createdAt } = defineProps(['userId', 'userAvatar', 'message', 'createdAt'])
const auth = useAuth()
const user = useState('auth').value
const isOwnMessage = computed(() => auth.session.value.id === userId)
// console.log({same: same.value, user});

const timeAgo = useTimeAgo(createdAt)
</script>

<template>
  <div class="flex w-full" :class="isOwnMessage ? 'justify-end' : 'justify-start'" v-if="message">
    <div class="message-card justify-start flex gap-3" :class="isOwnMessage ? '' : ''">
      <img :src="userAvatar" alt="User Avatar" class="user-avatar" :class="isOwnMessage ? 'order-2' : 'order-1'">
      <div class="message-content" :class="isOwnMessage ? ' order-1' : 'order-2'">
        <p>{{ message }}</p>
        <p class="created-at">
          {{ timeAgo }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add your own styles here */
.message-card {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-content {
  flex-grow: 1;
}

.created-at {
  font-size: 12px;
  color: #888;
}
</style>
