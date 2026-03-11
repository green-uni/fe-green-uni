<script setup>
import memberService from '@/services/memberService';
import { reactive } from 'vue';
import { useAuthStore } from '@/stores/authentication';
import { useRouter } from 'vue-router';

const authStore = useAuthStore()
const router = useRouter();

const state = reactive({
  form: {
    code: '20203001',
    password: '19901015'
  },
  modeShowPw: false
})

const pwView = () => { state.modeShowPw = !state.modeShowPw }

const login = async () => {
  const res = await memberService.logIn(state.form);
  console.log('result: ', res);

  if (res.status == 200) {
    const loginUser = res.data.result;
    console.log('loginUser: ', loginUser)
    authStore.logIn(loginUser);

    router.push('/member/me')
  }

}

</script>

<template>
  <div class="container">
    <div><input type="text" placeholder="아이디" v-model="state.form.code"></div>
    <div><input :type="state.modeShowPw ? 'text' : 'password'" placeholder="패스워드" v-model="state.form.password"><button
        @click="pwView">비밀번호 보기</button></div>
    <div><button @click="login">로그인</button></div>
  </div>

</template>

<style scoped>

</style>
