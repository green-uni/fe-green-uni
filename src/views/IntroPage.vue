
<script setup>
import logo from '@/assets/logo.png';
import memberService from '@/services/memberService';
import { reactive, watch } from 'vue';
import { useAuthStore } from '@/stores/authentication';
import { useRouter } from 'vue-router';
import LogIn from '@/components/content/LogIn.vue';

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
      <LogIn />
    </section>
  </div>

</template>

<style scoped>
.bg {  background: no-repeat 50% 0 url(https://images.unsplash.com/photo-1568792923760-d70635a89fdc?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D); }

</style>
