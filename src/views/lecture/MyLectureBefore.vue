<script setup>
import { useAuthStore } from '@/stores/authentication'; 
import  LectureService  from '@/services/lectureService';
import { reactive, onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';

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
  console.log("데이터 로딩 시작...");
  try {
    // 1. 일단 전체(혹은 승인전 전체)를 가져옵니다.
    const allList = await LectureService.getBeforeLecture();
    console.log("서버에서 온 데이터:", allList);
    
    if (allList && authStore.loginUserId) {
      // 2. 여기서 내 ID와 일치하는 것만 state.list에 담습니다.
      state.list = allList.filter(item => 
        String(item.memberId) === String(authStore.loginUserId)
      );
      console.log("필터링 된 내 강의:", state.list);
    } else {
      state.list = [];
    }
  } catch (error) {
    console.error("데이터 매칭 실패:", error);
    state.list = []; // 에러 시 빈 배열로 초기화해 화면 깨짐 방지
  } finally {
    state.isLoading = false;
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


    <DataTable :columns="['교과구분','강의명','교수명','이수학점','강의시간','대상학년','수강인원','강의실','승인상태']"
      :rows="state.list" gridCols="1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr" :isLoading="state.isLoading" emptyMessage="조회된 계정이 없습니다.">

      <article class="tbl-row" v-for="item in myLectureList" :key="item.lectureId" @click="moveToDetail(item.lectureId)">
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
      <article v-if="myLectureList.length === 0" class="no-data">
        <p>내가 개설한 강의가 없습니다.</p>
      </article>
    </DataTable>

  </div>
</template>

<style scoped>
</style>