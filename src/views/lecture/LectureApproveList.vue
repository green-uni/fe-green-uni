<script setup>
import { useAuthStore } from '@/stores/authentication'; 
import  LectureService  from '@/services/lectureService';
import { reactive, onMounted, computed, ref } from 'vue';
import { useRouter,useRoute } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import SearchInput from '@/components/util/SearchInput.vue';

const route = useRoute();
const authStore = useAuthStore();
const router=useRouter();

const searchInput = ref('');

const state = reactive({
  list: [],
  isLoading: false,
  pageGroupSize: 10,
  size: 5,
  currentPage: 1,
  maxPage: 0
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


// const myLectureList = computed(() => {
//   console.log("전체 강의 목록:", state.list); // 전체 강의 목록 확인
//   return state.list;
// });

// 검색
const filteredList = computed(() => {
  if (!searchInput.value) return state.list;

  return state.list.filter(item =>
    item.lectureName?.toLowerCase().includes(searchInput.value.toLowerCase())
  );
});

// 페이징 처리된 리스트 (DataTable에 뿌릴 데이터)
const pagedList = computed(() => {
  const start = (state.currentPage - 1) * state.size;
  const end = start + state.size;
  return filteredList.value.slice(start, end);
});

// 최대 페이지 수 계산
const maxPage = computed(() => {
  return Math.ceil(filteredList.value.length / state.size) || 1;
});
//페이지이동
const goToPage = (page) => {
  state.currentPage = page;
};

</script>

<template>
  <div class="container">
    <div class="filter-header">
      <div class="search-area input-content">
        <SearchInput v-model="searchInput" :list="filteredList" placeholder="강의명을 입력하세요"
         @update:modelValue="state.currentPage = 1"/>
        <button class="btn search-btn">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> 검색
        </button>
      </div>
    </div>

    <DataTable :columns="tableConfig.colsName"
      :rows="pagedList" :gridCols="tableConfig.cols" :isLoading="state.isLoading" emptyMessage="조회된 강의가 없습니다.">

      <article class="tbl-row" v-for="item in pagedList" :key="item.lectureId" @click="moveToDetail(item.lectureId)">
        <div>{{ item.lectureType }}</div>
        <div>{{ item.lectureName }}</div>
        <div>{{ item.proName }}</div>
        <div>{{ item.credit }}</div>
        <div>{{ item.dayOfWeek }} {{ item.startPeriod }}교시~{{ item.endPeriod  }}교시</div>
        <div>{{ item.academicYear }}학년</div>
        <div>{{ item.maxStd }}명</div>
        <div>{{ item.building }} {{ item.roomNumber }}</div>
        <div>
          <span :class="['status-badge', item.status]">
            {{ item.status === 'pending' ? '대기' : item.status === 'approved' ? '승인' : '반려' }}
          </span>
        </div>
      </article>
    </DataTable>
    <Pagination
      :currentPage="state.currentPage"
      :maxPage="maxPage"
      :pageGroupSize="state.pageGroupSize"
       @goToPage="goToPage"
    />

  </div>
</template>

<style scoped>
.tbl-row {cursor: pointer;}
.status-badge {
    display: inline-block;
    /* width: 32px; height: 32px; line-height: 32px; */
    border-radius: 10%; font-size: 14px; font-weight: 700; text-align: center;
}
.status-badge.pending { background-color: #f0ad4e; color: white}
.status-badge.approved { background-color: #3e9e7e; color: white}
.status-badge.rejected { background-color: #d9534f; color: white}
</style>