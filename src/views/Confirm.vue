<script setup>
import SectionTitle from '@/components/common/SectionTitle.vue';
</script>

<template>
  <div class="container">
    <SectionTitle text="여기에 제목 작성" />
    <div class="content">
      <h3>소제목</h3>
    </div>
  </div>
  <div class="container">
    <h2>소제목</h2>
    <div class="content">
      <h3>섹션 타이틀</h3>
    </div>
    <div class="content">
      <h3>섹션 타이틀</h3>
    </div>
  </div>
</template>

<style scoped>
.content {
  background: #fff;
}
</style>
