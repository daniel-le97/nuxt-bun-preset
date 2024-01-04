export default defineNitroTask({
  description: 'Run database migrations',
  run(payload, context) {
    console.log('Running DB migration task...', { payload, context })
    return { result: 'success' }
  },
})
