import type { AuthSession } from '~~/auth/server/utils/session'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Skip plugin when rendering error page
  if (nuxtApp.payload.error)
    return {}

  const { data: session, refresh: updateSession }
   = await useFetch<AuthSession>('/api/auth/session')

  const loggedIn: any = computed(() => !!session.value?.email)

  // Create a ref to know where to redirect the user when logged in
  const redirectTo = useState('authRedirect')

  /**
   * Add global route middleware to protect pages using:
   *
   * definePageMeta({
   *  auth: true
   * })
   */
  //

  addRouteMiddleware(
    'auth',
    (to) => {
      if (to.meta.auth && !loggedIn.value) {
        redirectTo.value = to.path
        return '/login'
      }
    },
    { global: true },
  )

  const currentRoute = useRoute()

  // @ts-expect-error it is there
  if (process.client) {
    watch(loggedIn, async (loggedIn) => {
      if (!loggedIn) {
        console.log('navigating to login')
        await navigateTo('/login')
      }
    })
  }

  // await navigateTo(redirectTo.value || '/')

  return {
    provide: {
      auth: {
        loggedIn,
        session,
        redirectTo,
        updateSession,
      },
    },
  }
})
