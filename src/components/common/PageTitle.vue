<script setup>
import { ref } from 'vue';
import { routes } from '@/router/routes';
import { useRoute } from 'vue-router';

const route = useRoute();
const menus = ref([])

console.log(routes);


</script>

<template>
<div class="d-flex jc-sb">
  <h1>페이지 제목</h1>
  <div class="location"></div>
</div>
</template>

<style scoped>

</style>
