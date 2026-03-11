<script setup>
import logo from '@/assets/logo.png';
import memberService from '@/services/memberService';
import { useAuthStore } from '@/stores/authentication';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore()

const doLogOut = async () => {
  const res = await memberService.logOut();
  console.log("logout res: ", res);
  if ( res.status == 200 ) {
    authStore.logOut();
    router.push('/login')
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

<style scoped></style>
