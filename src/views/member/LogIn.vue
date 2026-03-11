<script setup>
import memberService from '@/services/memberService';
import { reactive } from 'vue';
import { useAuthenticationStore } from '@/stores/authentication';

const authentication = useAuthenticationStore();

const state = reactive({
  data: {
    code: '20203001',
    password: '19901015'
  },
  modeShowPw: false
})

const pwView = () => {
    state.modeShowPw = !state.modeShowPw
}

const login = async () => {
    const result = await memberService.login(state.data);
    console.log('result: ', result);

    authentication.logIn(result.result);
}

</script>

<template>
  <div><input type="text" placeholder="아이디" v-model="state.data.code"></div>
  <div><input :type="state.modeShowPw ? 'text' : 'password'" placeholder="패스워드" v-model="state.data.password"><button
      @click="pwView">비밀번호 보기</button></div>
  <div><button @click="login">로그인</button></div>
</template>

<style scoped></style>
