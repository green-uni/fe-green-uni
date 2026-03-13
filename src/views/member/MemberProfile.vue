<script setup>
import { useAuthStore } from '@/stores/authentication';
import { reactive } from 'vue';

const authStore = useAuthStore()

console.log(authStore)

const state = reactive({
  profileInfo:{}
})


</script>

<template>
  <div>{{ authStore.loginUserId }}</div>
  <div>{{ authStore.name }}</div>
  <div>{{ authStore.code }}</div>
  <div>{{ authStore.role }}</div>
</template>

<style scoped>

</style>
