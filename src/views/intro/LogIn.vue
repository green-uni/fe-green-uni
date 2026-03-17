<script setup>
import logo from '@/assets/logo.png';
import memberService from '@/services/memberService';
import { reactive, watch } from 'vue';
import { useAuthStore } from '@/stores/authentication';
import { useRouter } from 'vue-router';

const authStore = useAuthStore()
const router = useRouter();

const state = reactive({
  form: {
    code: '20251003',
    password: '20070830'
  },
  modeShowPw: false,
  role: 'student'
})

watch(() => state.role, (role) => {
  if (role === 'student') {
    state.form.code = '20251003'
    state.form.password = '20070830'
  } else if (role === 'professor') {
    state.form.code = '20182010'
    state.form.password = '19740302'
  } else if (role === 'admin') {
    state.form.code = '20203001'
    state.form.password = '19901015'
  }
})

const pwView = () => { state.modeShowPw = !state.modeShowPw }

const login = async () => {
  try{
    const res = await memberService.logIn(state.form);
    authStore.logIn(res.result);
    router.push('/member/me')
  } catch(e){
    console.error(e)
  }
}
</script>

<template>
  <div class="d-grid h100vh" style="--grid-cols:500px 1fr">
    <div class="bg"></div>
    <section class="d-flex ai-center jc-center">
      <div class="login-wrap">
        <div class="d-flex ai-center jc-center">
          <img :src="logo" @click="moveToMain" />
        </div>
        <div class="input-content radio-group tab-radio-group">
          <label class="radio-label">
            <input type="radio" name="role" value="student" v-model="state.role">
            <span>학생</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="role" value="professor" v-model="state.role">
            <span>교수</span>
          </label>
          <label class="radio-label">
            <input type="radio" name="role" value="admin" v-model="state.role">
            <span>관리자</span>
          </label>
        </div>
        <div class="login-content" @keyup.enter="login">
          <div class="login-box">
            <label class="login-input">
              <input type="text" placeholder="학번/교번/사번" v-model="state.form.code">
            </label>
            <label class="login-input">
              <input :type="state.modeShowPw ? 'text' : 'password'" placeholder="비밀번호" v-model="state.form.password">
              <span @click="pwView" :class="!state.modeShowPw || 'show'"><font-awesome-icon icon="fa-solid fa-eye" /></span>
            </label>
          </div>
          <button class="btn btn-submit" @click="login">로그인</button>
        </div>
        <div>
          <button @click="router.push('/pw')">비밀번호 변경</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bg {  background: no-repeat 50% 0 url(https://images.unsplash.com/photo-1568792923760-d70635a89fdc?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D); }

.login-wrap{max-width:350px; width: 100%;display: grid;gap: 20px;}

.login-content{width: 100%;display: flex;gap: 10px;}
.login-content .login-box{flex-grow:1;display: flex;flex-direction: column;}
.login-content .login-box .login-input{position: relative;}
.login-content .login-box .login-input:first-child input{border-bottom:0}
.login-content .login-box .login-input input{width: 100%;padding: 10px;border: 1px solid #ccc;}
.login-content .login-box .login-input input:focus-visible{border: 1px solid var(--main-color)}
.login-content .login-box .login-input span{position: absolute;right: 10px;top: 50%;transform: translateY(-50%);color: #ddd;cursor: pointer;}
.login-content .login-box .login-input span.show{color: var(--font-color);}

.login-content button.btn{width: 100px;}

.tab-radio-group { gap: 0;border: 1px solid #ddd;display: grid;grid-template-columns: 1fr 1fr 1fr;overflow: hidden; }
.tab-radio-group label { color: #999; padding:10px;font-weight: 700;text-align: center; font-size: 0.95rem;letter-spacing: 2px;}
.tab-radio-group label:not(:first-child) { border-left: 1px solid #ddd;}
.tab-radio-group label input { display: none;}
.tab-radio-group label:has(input:checked) {border: 1px solid var(--main-color);border-bottom-width:2px; color: var(--main-color);}
</style>
