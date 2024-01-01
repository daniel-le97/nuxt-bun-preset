<template>
  <div  class="flex  " :class="  user.name === session.name  ? 'justify-start' : ' justify-end'">
   <div class="space-y-1 flex flex-col items-center">
      <div class="text-gray-500 text-xs">
        created: jan 1, 2021
       </div>
      <div class=" p-2 rounded-lg relative" :class="user.name === session.name ? 'bg-emerald-400' : 'bg-gray-100'">
    
        <p class="text-black">{{ body }}</p>

   
  
      </div>
   </div>
  </div>
</template>

<script lang="ts" setup>
const {id,user } =defineProps({
  id: Number,
  user: Object,
  chatRoomId: String,
  body: String
})

const { session } = useAuth();

</script>

<style>
/* Add any additional styling if needed */
</style>
