<script setup>
import { computed, ref } from 'vue';
import { routes } from '@/router/routes';
import { useRoute } from 'vue-router';

const route = useRoute();

const groupTitle = computed(() => route.meta?.groupTitle);
const subTitle = computed(() => route.meta?.subTitle);
const title = computed(() => route.meta?.title);

</script>

<template>
  <div class="page-location d-flex jc-space-b ai-end">
    <h1>
      <span class="arrow-circle">
        <font-awesome-icon icon="fa-solid fa-angle-right" />
      </span>
      {{ title }}</h1>
    <ul class="location">
      <li>{{ groupTitle }}</li>
      <li v-if="subTitle"><font-awesome-icon icon="fa-solid fa-angle-right" /></li>
      <li v-if="subTitle">{{ subTitle }}</li>
      <li><font-awesome-icon icon="fa-solid fa-angle-right" /></li>
      <li>{{ title }}</li>
    </ul>
  </div>
</template>

<style scoped>
.page-location{margin-bottom: 15px;}
h1 {font-size: var(--text-xxl);font-weight: 500;display: inline-flex;align-items: center;gap: 10px;}
h1 .arrow-circle{background: var(--font-color);width: 25px;height: 25px;border-radius: 50%;display: inline-flex;align-items: center;justify-content: center;}
h1 .arrow-circle svg{color: #fff;font-size: .6em;}

.location{display: flex;color:var(--font-color-light);display: inline-flex;align-items: center;gap: 5px;}
.location li{position: relative;}
.location li svg{font-size: .8em;}
</style>
