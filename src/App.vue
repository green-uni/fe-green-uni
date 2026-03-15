<script setup>
// import { RouterLink, RouterView } from 'vue-router'
import PageTitle from '@/components/layout/PageTitle.vue';
import LeftNav from '@/components/layout/LeftNav.vue';
import TopHeader from '@/components/layout/TopHeader.vue';
import { useAuthStore } from './stores/authentication';
import Modal from './components/common/Modal.vue';
// import router from './router';

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
      <div class="container-wr">
        <RouterView/>
      </div>
    </main>
  </div>
  <Modal/>
</template>

<style>
.all-wrap {  display: grid; grid-template-columns: 270px 1fr; grid-template-rows: 80px 1fr; height: 100vh; width: 100vw; overflow: hidden; color: var(--font-color);}
header { grid-column: 1 / -1;padding:0 var(--size-df);display: grid;}

.all-wrap main { background: #eee; padding:50px 60px 100px; border-top-left-radius: 30px; overflow-y: auto;}
/* .container{padding:40px 50px;background: #fff;} */
.container{display: flex;flex-direction: column;gap: 10px;}
.container > h2{font-size: 1.5rem;font-weight: 600;}

/* 화이트박스 */
.content-wrap { background: #fff; padding:var(--size-df);display: flex;flex-direction: column;border-radius:var(--bdrs-df);border: 1px solid var(--line-color);}
.content-wrap h3{border-bottom: 1px solid var(--line-color);font-weight: 500;font-size: var(--text-lg);padding:var(--size-sm) var(--size-df);background: #f5f5f5;}
.content-wrap h3 svg{margin-right: 5px;}


</style>
