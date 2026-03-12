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

let userRole = '';
if( authStore.role == 'admin'){
  userRole = '관리자'
}else if( authStore.role == 'professor' ){
  userRole = '교수'
}else {
  userRole = '학생'
}

</script>

<template>
  <div class="d-flex ai-center jc-space-b">
    <div class="uni-title d-flex ai-center">
      <img :src="logo" @click="moveToMain" />
      <h1>그린대학교 학사관리 시스템</h1>
      <p>university resource planning</p>
    </div>
    <div class="user-box d-flex ai-center">
      <div class="user-info">
        <p class="user-name">{{ authStore.name }}님 반갑습니다</p>
        <p><span>{{ authStore.code }}</span><span>{{ userRole }}</span></p>
      </div>
      <a @click.prevent="doLogOut" class="pointer">로그아웃</a>
    </div>
  </div>
</template>

<style scoped>
.uni-title{gap: 10px;}
.uni-title h1{font-weight: 500;font-size: .95rem;}
.uni-title p{opacity: .3;text-transform: uppercase;font-size: .9rem;}
.user-box{gap: 10px;}
.user-box .user-info{padding: 15px 25px;background: var(--default-bg);border-radius: 50px;line-height: 1;display: flex;flex-direction: column;gap: 2px;}
.user-box .user-info .user-name{font-weight: 600;}
.user-box .user-info span{font-size: .8rem;opacity: .5;position: relative;}
.user-box .user-info span:nth-of-type(2){margin-left: 5px;padding: 5px;}
.user-box .user-info span:nth-of-type(2):before{content:'·';left: 0;position: absolute;}
.user-box a{font-size: .9rem;opacity: .5;font-weight: 500;}
.user-box a:hover{opacity: 1;}
</style>
