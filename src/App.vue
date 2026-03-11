<script setup>
// import { RouterLink, RouterView } from 'vue-router'
import PageTitle from '@/components/common/PageTitle.vue';
import LeftNav from './components/common/LeftNav.vue';
import topHeader from './components/common/topHeader.vue';
import router from './router';
</script>

<template>
  <div class="all-wrap">
    <header>
      <topHeader/>
    </header>
    <LeftNav />
    <main>
      <PageTitle />
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
