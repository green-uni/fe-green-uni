<script setup>
import logo from '@/assets/logo.png';
import memberService from '@/services/memberService';
import { useAuthenticationStore } from '@/stores/authentication';

const authentication = useAuthenticationStore();

const doLogOut = async () => {
  const result = await memberService.logOut();
  console.log("result: ", result);
  if(result.result === 1){
    authentication.logOut();
  } else {
    alert("로그아웃 실패!")
  }
}

</script>

<template>
  <div style="display: flex; justify-content: space-between;align-items: center;">
    <div class="uni-title">
      <img :src="logo" @click="moveToMain" />
    </div>
    <div class="member-info">
      <!-- <router-link>로그아웃</router-link> -->
       <a @click.prevent="doLogOut" class="pointer">로그아웃</a>
    </div>
  </div>
</template>

<style scoped>

</style>
