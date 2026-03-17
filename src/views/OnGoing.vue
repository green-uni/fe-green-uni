<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const planContent = computed(() => route.meta?.planContent);
const planTitle = computed(() => route.meta?.planTitle);

</script>

<template>
  <div class="container">
    <h2></h2>
    <div class="content-wrap">
        <h4><span>2차 프로젝트 때 구현 예정</span>
          <p>{{ planTitle }}</p>
        </h4>
        <div>{{ planContent }}</div>
      </div>
  </div>
</template>

<style scoped>
.content-wrap{text-align: center;padding: 50px;}
h4 span{background-color:var(--font-color); color: #fff;display: inline-block;padding: 5px 10px;font-size: .9em;line-height: 1;}
h4 p{font-size: 1.8em;padding: 5px;font-weight: 600;}
.content-wrap > div{margin: 10px 0;border: 1px solid var(--line-color);border-radius: var(--bdrs-sm);overflow: hidden; padding: 20px;    align-self: center; max-width: 800px;width: 100%;}
</style>
