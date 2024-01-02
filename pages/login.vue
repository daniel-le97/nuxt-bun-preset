<script setup lang="ts">
useHead({
  title: 'Login Page',
})

const tabs = [
  {
    label: 'Log In',
    slot: 'login',
  },
  {
    label: 'Register',
    slot: 'register',
  },
]

const loginForm = ref({
  email: 'test@gmail.com',
  password: 'password',
})
const registerForm = ref({
  email: 'test@gmail.com',
  password: 'password',
})
const hidden = ref(true)

const toast = useToast()



async function authEvent(type: 'login' | 'register') {
  try {
    const event = type === 'register' ? authRegister : authLogin
    const data = type === 'login' ? {email: loginForm.value.email, password: loginForm.value.password} : {email: registerForm.value.email, password: registerForm.value.password}
    await event(data.email, data.password)
    const ws = useNuxtApp().$ws
    const auth = useAuth()
    ws.send(JSON.stringify({type: 'auth', data: auth.session.value}))
  } catch (error) {
    onError(error)
  }
}

function onError(err: any) {
  toast.add({
    color: 'red',
    title: 'Error',
    description: err?.data.message ?? err?.message ?? err,
  })
}
</script>

<template>
  <UContainer :ui="{ constrained: 'max-w-xl' }">
    <UTabs class="p-4" :items="tabs">
      <template #login="{ item }">
        <UForm :state="loginForm" @submit="authEvent('login')">
          <UCard>
            <template #header>
              <div class="flex">
                <UIcon class="w-12 h-12 mr-2 bg-primary" name="i-heroicons-user" />
                <div>
                  <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    {{ item.label }}
                  </p>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Log in to your account.
                  </p>
                </div>
              </div>
            </template>

            <UFormGroup label="Email" name="email" class="mb-3" required>
              <UInput v-model="loginForm.email" placeholder="user@gmail.com" icon="i-heroicons-envelope" />
            </UFormGroup>
            <UFormGroup label="Password" name="password" required>
              <UInput
                v-model="loginForm.password"
                placeholder="password"
                icon="i-heroicons-lock-closed"
                :type="hidden ? 'password' : 'text'"
                :ui="{ icon: { trailing: { pointer: '' } } }"
              >
                <template #trailing>
                  <UButton
                    :icon="hidden ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                    variant="link"
                    :padded="false"
                    @click="hidden = !hidden"
                  />
                </template>
              </UInput>
            </UFormGroup>

            <template #footer>
              <UButton class="w-full justify-center" type="submit">
                Log in
              </UButton>
            </template>
          </UCard>
        </UForm>
      </template>
      <template #register="{ item }">
        <UForm :state="registerForm" @submit="authEvent('register')">
          <UCard>
            <template #header>
              <div class="flex">
                <UIcon class="w-12 h-12 mr-2 bg-cyan-400" name="i-heroicons-user-plus" />
                <div>
                  <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    {{ item.label }}
                  </p>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Create an account
                  </p>
                </div>
              </div>
            </template>

            <UFormGroup label="Email" name="email" class="mb-3" required>
              <UInput v-model="registerForm.email" placeholder="user@gmail.com" icon="i-heroicons-envelope" />
            </UFormGroup>
            <UFormGroup label="Password" name="password" required>
              <UInput
                v-model="registerForm.password"
                placeholder="password"
                icon="i-heroicons-lock-closed"
                :type="hidden ? 'password' : 'text'"
                :ui="{ icon: { trailing: { pointer: '' } } }"
              >
                <template #trailing>
                  <UButton
                    :icon="hidden ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                    variant="link"
                    :padded="false"
                    @click="hidden = !hidden"
                  />
                </template>
              </UInput>
            </UFormGroup>

            <template #footer>
              <UButton class="w-full justify-center" type="submit" color="cyan">
                Register
              </UButton>
            </template>
          </UCard>
        </UForm>
      </template>
    </UTabs>
  </UContainer>
</template>
