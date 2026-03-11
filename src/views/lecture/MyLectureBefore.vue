<script setup>
import majorService from '@/services/majorService';
import { LectureService } from '@/services/lectureService';
import { reactive, onMounted } from 'vue';

const state = reactive({
  list: [],
  size: 30,
  currentPage: 1,
  maxPage: 0
});

// 데이터 호출 예시
onMounted(async () => {
  // 여기에 실제 서비스 호출 코드를 넣어주세요
});
</script>

<template>
  <div>
    <section class="table" style="--grid-cols: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;">
      
      <article class="head">
        <div>교과구분</div>
        <div>강의명</div>
        <div>교수명</div>
        <div>이수학점</div>
        <div>강의시간</div>
        <div>대상학년</div>
        <div>수강인원</div>
        <div>강의실</div>
      </article>

      <article class="row" v-for="item in state.list" :key="item.lectureId">
        <div>{{ item.type }}</div>
        <div>{{ item.name }}</div>
        <div>{{ item.proName }}</div>
        <div>{{ item.credit }}</div>
        <div>{{ item.lectureTime }}</div>
        <div>{{ item.targetGrade }}</div>
        <div>{{ item.maxStd }}</div>
        <div>{{ item.building }} {{ item.roomNumber }}</div>
      </article>
      
    </section>
  </div>
</template>

<style scoped>

</style>