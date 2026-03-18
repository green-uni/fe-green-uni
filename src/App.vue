<script setup>
import { useAuthStore } from './stores/authentication';
import PageTitle from '@/components/layout/PageTitle.vue';
import LeftNav from '@/components/layout/LeftNav.vue';
import TopHeader from '@/components/layout/TopHeader.vue';
import Modal from './components/common/Modal.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore()

</script>

<template>
  <div :class="authStore.isLogin ? 'all-wrap' : 'log-in'">
    <header v-if="authStore.isLogin" >
      <TopHeader/>
    </header>
    <LeftNav  v-if="authStore.isLogin" />
    <main>
      <PageTitle  v-if="authStore.isLogin" />
      <div class="bg pointer" v-if="!authStore.isLogin" @click="router.push('/')"></div>
      <div class="container-wr">
        <RouterView/>
      </div>
    </main>
  </div>
  <Modal/>
</template>

<style>
.all-wrap {  display: grid; grid-template-columns: 270px 1fr; grid-template-rows: 80px 1fr; height: 100vh; width: 100vw; color: var(--font-color);}
header { grid-column: 1 / -1;padding:0 var(--size-df);display: grid;}

.all-wrap main { background: #eee; padding:50px 60px 120px; border-top-left-radius: 30px; overflow-y: auto; min-width:1200px; }
/* .container{padding:40px 50px;background: #fff;} */
.container-wr{max-width: 1650px;}
.container{display: flex;flex-direction: column;gap: 10px;}
.container > h2{font-size: 1.5rem;font-weight: 600;}

/* 화이트박스 */
.content-wrap { background: #fff; padding:var(--size-df);display: flex;flex-direction: column;border-radius:var(--bdrs-df);border: 1px solid var(--line-color);}
.content-wrap h3{border-bottom: 1px solid var(--line-color);font-weight: 500;font-size: var(--text-lg);padding:var(--size-sm) var(--size-df);background: #f5f5f5; border-radius: var(--bdrs-df) var(--bdrs-df) 0 0;line-height: 1;}
.content-wrap h3 svg{margin-right: 5px;}

/* 로그인 */
.log-in{}
.log-in main{ display: grid; grid-template-columns: 500px 1fr;}
.log-in .bg { background: no-repeat 50% 0 url(https://images.unsplash.com/photo-1568792923760-d70635a89fdc?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D); }

</style>
