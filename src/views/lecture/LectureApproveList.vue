<script setup>
import { useAuthStore } from '@/stores/authentication'; 
import  LectureService  from '@/services/lectureService';
import { reactive, onMounted, computed, ref } from 'vue';
import { useRouter,useRoute } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';

const route = useRoute();
const authStore = useAuthStore();
const router=useRouter();
// 검색 관련 변수 선언 추가
const searchInput = ref('');
const searchKeyword = ref('');
const state = reactive({
  list: [],
  isLoading: false,
  size: 30,
  currentPage: 1,
  maxPage: 0
});


// // 내 강의만 필터링하는 변수
const myLectureList = computed(() => {
  console.log("전체 강의 목록:", state.list); // 전체 강의 목록 확인
  return state.list;
});

const BeforeLectureList = async () => {
  state.isLoading = true;
  try {
    const result = await LectureService.getMyLecture();
    console.log("서버에서 온 데이터:", result);
    state.list = result || [];
  } catch (error) {
    console.error("데이터 매칭 실패:", error);
    state.list = [];
  } finally {
    state.isLoading = false;
  }
};

const tableConfig = computed(() => {
  switch (authStore.role) {
    default:  // 전체
      return {
        colsName: ['교과구분','강의명','교수명','이수학점','강의시간','대상학년','수강인원','강의실','승인상태'],
        cols : '1fr 3fr 1fr 1fr 2fr 1fr 1fr 2fr 1fr'
    } 
  }  
})

// 데이터 호출 예시
onMounted(async () => {
  BeforeLectureList();
});

const id=route.params.lectureId;
const moveToDetail = (id) => {
  console.log("이동하려는 강의 ID:", id);
  router.push(`/lectures/${id}`);
};

// 검색 실행
const handleSearch = () => {
  searchKeyword.value = searchInput.value;
};

// 엔터 검색
const keydown = (e) => {
  if (e.key === 'Enter') handleSearch();
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


    <DataTable :columns="tableConfig.colsName"
      :rows="myLectureList" :gridCols="tableConfig.cols" :isLoading="state.isLoading" emptyMessage="조회된 강의가 없습니다.">

      <article class="tbl-row" v-for="item in myLectureList" :key="item.lectureId" @click="moveToDetail(item.lectureId)">
        <div>{{ item.lectureType }}</div>
        <div>{{ item.lectureName }}</div>
        <div>{{ item.proName }}</div>
        <div>{{ item.credit }}</div>
        <div>{{ item.dayOfWeek }} {{ item.startPeriod }}교시~{{ item.endPeriod  }}교시</div>
        <div>{{ item.academicYear }}학년</div>
        <div>{{ item.maxStd }}명</div>
        <div>{{ item.building }} {{ item.roomNumber }}</div>
        <div v-if="authStore.role === 'admin' || authStore.role === 'professor'">{{ item.status === 'pending' ? '승인대기' : item.status === 'approved' ? '승인' : '반려' }}</div>
      </article>
    </DataTable>

  </div>
</template>

<style scoped>
.tbl-row {cursor: pointer;}
</style>