<script setup>
// Props
const props = defineProps([ 'userId', 'userAvatar', 'message', 'createdAt'])
const id = useAuth().session?.id
const timeAgo = useTimeAgo(props.createdAt)
</script>

<template>
  <div class="message-card" :class="[{ 'own-message': userId === id }]">
    <img :src="userAvatar" alt="User Avatar" class="user-avatar">
    <div class="message-content">
      <p>{{ message }}</p>
      <p class="created-at">
       {{ timeAgo }}
      </p>
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

.own-message {
  justify-content: flex-end;
}
</style>
