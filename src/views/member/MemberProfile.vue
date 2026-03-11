<script setup>
import { useAuthStore } from '@/stores/authentication';

const authStore = useAuthStore()

console.log(authStore)
</script>

<template>
  <div>{{ authStore.loginUserId }}</div>
  <div>{{ authStore.name }}</div>
  <div>{{ authStore.code }}</div>
  <div>{{ authStore.role }}</div>
</template>

<style scoped>

</style>
