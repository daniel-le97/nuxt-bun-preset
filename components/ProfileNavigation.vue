<script setup>
const user = useAuth().session.value
const links = [{
  label: user.name,
  avatar: {
    src: user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
  },
  to: '/profile',
  // badge: user.id,
}, {
  label: 'Sign out',
  icon: 'i-heroicons-home',
  click: async () => {
    await navigateTo('/login')
    await authLogout()
  },
}]
</script>

<template>
  <UVerticalNavigation :links="links" />
</template>
