<script setup>
// import { RouterLink, RouterView } from 'vue-router'
import PageTitle from '@/components/common/PageTitle.vue';
import LeftNav from '@/components/common/LeftNav.vue';
import TopHeader from '@/components/common/TopHeader.vue';
import { useAuthStore } from './stores/authentication';
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
      <RouterView/>
    </main>
  </div>
</template>

<style scoped>
.all-wrap {
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: 100px 1fr;
  height: 100%;
}

header {
  grid-column: 1 / -1;padding: 0 30px;
}
TopHeader{grid-column: 1 / -1;}

.all-wrap main {
  background: #eee;
  padding: 70px;
  border-top-left-radius: 30px;
}


.log-in{height: 100%;display: flex;justify-content: center;align-items: center;}
.log-in main{border-radius: 30px;border: 1px solid #ddd;padding: 50px;}

</style>
