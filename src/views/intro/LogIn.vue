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
    code: '20201003',
    password: '20000101'
  },
  modeShowPw: false,
  role: 'student'
})

watch(() => state.role, (role) => {
  if (role === 'student') {
    state.form.code = '20201003'
    state.form.password = '20000101'
  } else if (role === 'professor') {
    state.form.code = '20262002'
    state.form.password = '19851022'
  } else if (role === 'admin') {
    state.form.code = '20203001'
    state.form.password = '19901015'
  }
})

const pwView = () => { state.modeShowPw = !state.modeShowPw }

const login = async () => {
  try {
    const res = await memberService.logIn(state.form);
    authStore.logIn(res.result);
    router.push('/member/me')
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <section class="d-flex ai-center jc-center h100vh">
    <div class="login-wrap">
      <div class="d-flex ai-center jc-center">
        <img :src="logo" @click="moveToMain" />
      </div>
      <div class="input-content radio-group radio-tab">
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
        <div class="login-box input-content">
          <label class="login-input">
            <input type="text" placeholder="학번/교번/사번" v-model="state.form.code">
          </label>
          <label class="login-input">
            <input :type="state.modeShowPw ? 'text' : 'password'" placeholder="비밀번호" v-model="state.form.password">
            <span @click="pwView" class="showPw" :class="!state.modeShowPw || 'show'"><font-awesome-icon
                icon="fa-solid fa-eye" /></span>
          </label>
        </div>
        <button class="btn btn-submit" @click="login">로그인</button>
      </div>
      <div class="changePw">
        <button @click="router.push('/pw')">비밀번호 찾기</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-wrap{max-width:350px; width: 100%;display: grid;gap: 20px;}

.login-content{width: 100%;display: flex;gap: 10px;}
.login-content .login-box{flex-grow:1;display: flex;flex-direction: column;gap: 5px;}
.login-content .login-box .login-input{position: relative;}

.radio-group{font-size: 1rem;gap: 2px;}
.radio-tab .radio-label:nth-of-type(1){border-radius: 15px 2px 2px 15px;}
.radio-tab .radio-label:nth-of-type(2){border-radius: 2px;}
.radio-tab .radio-label:nth-of-type(3){border-radius: 2px 15px 15px 2px;}
.radio-tab .radio-label:has(input[type='radio']:checked){background: #fff;color: var(--main-color);font-weight: bold;}

.showPw{position: absolute;right: 10px;top: 50%;transform: translateY(-50%);color: #ddd;cursor: pointer;}
.showPw.show{color: var(--font-color);}

.login-content button.btn{width: 100px;}

.changePw{border-top: 1px solid var(--line-color);padding: 10px 0;}
.changePw button{font-size: .9em;background: none;border: none;color: #aaa;cursor: pointer;text-decoration: underline; text-underline-offset:4px;}
.changePw button:hover{color: var(--main-color);}
</style>
