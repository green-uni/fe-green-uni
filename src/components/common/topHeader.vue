<script setup>
import logo from '@/assets/logo.png';

</script>

<template>
  <div style="display: flex; justify-content: space-between;align-items: center;">
    <div class="uni-title">
      <img :src="logo" @click="moveToMain" />
    </div>
    <div class="member-info">
      <!-- <router-link>로그아웃</router-link> -->
       <a >로그아웃</a>
    </div>
  </div>
</template>

<style scoped>

</style>
