<script setup>
import { computed, ref } from 'vue';
import { routes } from '@/router/routes';
import { useRoute } from 'vue-router';

const route = useRoute();

const groupTitle = computed(() => route.meta?.groupTitle);
const title = computed(() => route.meta?.title);
</script>

<template>
  <div class="d-flex jc-sb ai-e">
    <h1>{{ title }}</h1>
    <ul class="location">
      <li>{{ groupTitle }}</li>
      <li>{{ title }}</li>
    </ul>
  </div>
</template>

<style scoped>
h1 {font-size: 32px;font-weight: 500;}
.location{display: flex;opacity: .5;}
.location li{position: relative;}
.location li:not(:first-child){margin-left: 10px;}
.location li:not(:first-child):before{content:">";margin-right: 10px;}
</style>
