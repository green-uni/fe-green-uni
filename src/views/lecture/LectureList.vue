<script setup>
  import majorService from '@/services/majorService';
  import { LectureService } from '@/services/lectureService';
  import { onMounted, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authentication';


  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const state = reactive({
    list: [],
    
    size: 30,
    currentPage: 1,
    maxPage: 0
  });

onMounted(async () => {
  try {
    const res = await LectureService.getLectureList();
    console.log("서버 응답 확인:", res); // 👈 여기서 데이터 구조를 반드시 확인하세요!
    state.list = res || []; // 데이터가 없으면 빈 배열 할당
  } catch (error) {
    console.error("목록 로드 실패:", error);
  }
});

</script>

<template>
  <div class="container">
    <section class="tbl-wrap">
      <article class="tbl-head">
        <div>이수구분</div>
        <div>전공명</div>
        <div>강의명</div>
        <div>교수명</div>
        <div>강의실</div>
        <div>강의시간</div>
        <div>이수학점</div>
        <div>대상학년</div>
      </article>
      <article class="tbl-row" v-for="item in state.list" :key="item.lectureId">
        <div>{{item.lectureType}}</div>
        <div>{{item.majorName}}</div>
        <div>{{item.lectureName}}</div>
        <div>{{item.proName}}</div>
        <div>{{item.building}}{{ item.roomNumber }}</div>
        <div>{{item.dayOfWeek}}</div>
        <div>{{item.credit}}</div>
        <div>{{item.academicYear}}</div>
      </article>
      <article v-if="state.list.length === 0" class="no-data">
        <p>조회된 계정이 없습니다.</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
/* table의 column 갯수와 크기는 아래와 같이 설정 */
.tbl-wrap{
  --grid-cols: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr
  }
</style>