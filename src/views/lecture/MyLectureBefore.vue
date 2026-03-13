<script setup>
import majorService from '@/services/majorService';
import  LectureService  from '@/services/lectureService';
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';

const router=useRouter();

const state = reactive({
  list: [],

  size: 30,
  currentPage: 1,
  maxPage: 0
});

const BeforeLectureList = async () => {
try {
    const res = await LectureService.getBeforeLecture();
    console.log("서버 응답 확인:", res); // 👈 여기서 데이터 구조를 반드시 확인하세요!
    state.list = res || []; // 데이터가 없으면 빈 배열 할당
  } catch (error) {
    console.error("목록 로드 실패:", error);
  }
};

// 데이터 호출 예시
onMounted(async () => {
  BeforeLectureList();
});
const moveToDetail=(lectureId) => {
  router.push(`/lectures/${lectureId}`);
};

// 검색 실행
const search = () => {
  searchKeyword.value = searchInput.value;
};

// 엔터 검색
const keydown = (e) => {
  if (e.key === 'Enter') search();
};
</script>

<template>
  <div>
      <div class="search-area">
        <input
          v-model="searchInput"
          type="text"
          placeholder="검색어를 입력하세요"
          class="search-input"
          @keydown="keydown"
        />
        <button class="search-btn" @click="handleSearch">검색</button>
      </div>


    <DataTable :columns="['교과구분','강의명','교수명','이수학점','강의시간','대상학년','수강인원','강의실','승인상태']"
      :rows="state.list" gridCols="1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr" :isLoading="state.isLoading" emptyMessage="조회된 계정이 없습니다.">

      <article class="tbl-row" v-for="item in state.list" :key="item.lectureId" @click="moveToDetail(item.lectureId)">
        <div>{{ item.lectureType }}</div>
        <div>{{ item.lectureName }}</div>
        <div>{{ item.proName }}</div>
        <div>{{ item.credit }}</div>
        <div>{{ item.dayOfWeek }}</div>
        <div>{{ item.academicYear }}학년</div>
        <div>{{ item.maxStd }}명</div>
        <div>{{ item.building }} {{ item.roomNumber }}</div>
        <div>{{ item.status === 'before' ? '승인대기' : item.status }}</div>
      </article>
    </DataTable>

  </div>
</template>

<style scoped>
</style>
