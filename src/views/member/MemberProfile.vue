<script setup>
import { useAuthenticationStore } from '@/stores/authentication';
const authentication = useAuthenticationStore();

console.log(authentication.state.loginUser)
</script>

<template>
  <div>{{ authentication.state.loginUser.loginUserId }}</div>
  <div>{{ authentication.state.loginUser.name }}</div>
  <div>{{ authentication.state.loginUser.code }}</div>
</template>

<style scoped>

</style>
