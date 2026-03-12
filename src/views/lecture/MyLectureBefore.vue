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
        <button class="search-btn" @click="handleSearch">
          <span class="search-icon">🔍</span> 검색
        </button>
      </div>

    <section class="tbl-wrap">

      <article class="tbl-head">
        <div>교과구분</div>
        <div>강의명</div>
        <div>교수명</div>
        <div>이수학점</div>
        <div>강의시간</div>
        <div>대상학년</div>
        <div>수강인원</div>
        <div>강의실</div>
        <div>승인상태</div>
      </article>

      <article class="tbl-row" v-for="item in state.list" :key="item.lectureId">
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

    </section>
  </div>
</template>

<style scoped>
.tbl-wrap { --grid-cols: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr }
</style>
