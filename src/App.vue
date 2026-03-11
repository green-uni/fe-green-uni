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
  grid-template-rows: 70px 1fr;
  height: 100%;
}

header {
  grid-column: 1 / -1;
}

main {
  background: #eee;
  padding: 70px;
  border-top-left-radius: 30px;
}
</style>
