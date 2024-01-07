<script setup lang="ts">
const { $auth } = useNuxtApp()

const icon = computed(() => $auth.session.value?.email ? 'i-heroicons-lock-open' : 'i-heroicons-lock-closed')
const { path, params } = useRoute()
const isProfileRoute = computed(() => path === '/profile')
</script>

<template>
  <!-- <NuxtExample dir="auth/local" :icon="icon"> -->
  <!-- <template #nav> -->
  <!-- <nav v-if="isProfileRoute" class="bg-gray-800 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <div>
        <NuxtLink to="/">
          Home
        </NuxtLink>
        <NuxtLink v-if="!$auth.loggedIn.value" to="/login">
          Login
        </NuxtLink>
      </div>
    </div>
  </nav> -->

  <!-- </template> -->
  <NuxtPage />
  <!-- to show toasts -->
  <ClientOnly>
    <UNotifications />
  </ClientOnly>
</template>
