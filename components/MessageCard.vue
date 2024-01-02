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
  <div>
    <div v-if="isOwnMessage" class="message-card flex justify-end">
      <img :src="userAvatar" alt="User Avatar" class="user-avatar">
      <div class="message-content">
        <p>{{ message }}</p>
        <!-- <div> cats </div> -->
        <p class="created-at">
          {{ timeAgo }}
        </p>
      </div>
    </div>
    <div v-else class="message-card">
      <img :src="userAvatar" alt="User Avatar" class="user-avatar">
      <div class="message-content">
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
