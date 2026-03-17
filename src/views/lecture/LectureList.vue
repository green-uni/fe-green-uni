<script setup>
  import  LectureService  from '@/services/lectureService';
  import { onMounted, reactive, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import DataTable from '@/components/common/DataTable.vue';
  import Pagination from '@/components/common/Pagination.vue';
  import SearchInput from '@/components/util/SearchInput.vue';
  import { ref } from 'vue';

  const searchInput = ref('');
  const route = useRoute();
  const router = useRouter();


  const state = reactive({
    list: [],
    lectureList: [],
    relatedSearchList:[],
    selectedIndex: -1,
    size: 5,
    pageGroupSize: 10,
    currentPage: 1,
    maxPage: 0,
    isLoading: false,
  });

onMounted(async () => {
  state.isLoading = true;
  try {
    const res = await LectureService.getLectureList();
    state.list = (res || []).filter(item => item.status === 'approved');
    console.log("서버 응답 확인:", res); // 👈 여기서 데이터 구조를 반드시 확인하세요!
  } catch (error) {
    console.error("목록 로드 실패:", error);
  } finally {
    state.isLoading = false;
  }

});

const id=route.params.lectureId;
const moveToDetail = (id) => {
  console.log("이동하려는 강의 ID:", id);
  router.push(`/lectures/${id}`);
};

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
        <SearchInput v-model="searchInput" :list="state.list" placeholder="강의명을 입력하세요"
         @update:modelValue="state.currentPage = 1"/>
        <button class="btn search-btn">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> 검색
        </button>
      </div>
    </div>
    <DataTable :columns="['이수구분', '전공명', '강의명','교수명','강의실','강의시간','이수학점','대상학년']"
      :rows="pagedList" gridCols="1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr" :isLoading="state.isLoading" emptyMessage="조회된 계정이 없습니다.">
      <article class="tbl-row" v-for="item in pagedList" :key="item.lectureId" @click="moveToDetail(item.lectureId)">
        <div>{{item.lectureType}}</div>
        <div>{{item.majorName}}</div>
        <div>{{item.lectureName}}</div>
        <div>{{item.proName}}</div>
        <div>{{item.building}}{{ item.roomNumber }}</div>
        <div>{{item.dayOfWeek}}{{ item.startPeriod }} 교시~ {{ item.endPeriod }}교시</div>
        <div>{{item.credit}}</div>
        <div>{{item.academicYear}}</div>
      </article>
    </DataTable>
    <Pagination
  :currentPage="state.currentPage"
  :maxPage="maxPage"
  :pageGroupSize="state.pageGroupSize"
  @goToPage="goToPage"/>
  </div>
</template>

<style scoped>
.tbl-row {cursor: pointer;}
</style>
