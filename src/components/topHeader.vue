<script setup>
import logo from '@/assets/common/logo.png';

</script>

<template>
  <div style="display: flex; justify-content: space-between;align-items: center;">
    <div class="uni-title">
      <img :src="logo" @click="moveToMain" />
    </div>
    <div class="member-info">
      <router-link>로그아웃</router-link>
    </div>
  </div>
</template>

<style scoped>

</style>
