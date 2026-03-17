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
    console.log("서버 응답 확인:", res); // 데이터 구조 확인
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


// 검색어에 따라 리스트 필터링
const filteredList = computed(() => {
  if (!searchInput.value) return state.list;

  const keyword = searchInput.value.toLowerCase();

  return state.list.filter(item => {
    const matchLecture =
      item.lectureName?.toLowerCase().includes(keyword);

    const matchProfessor =
      item.proName?.toLowerCase().includes(keyword);

    return matchLecture || matchProfessor;
  });
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
      <div class="tab-area">
        <button v-for="tab in tabs" :key="tab" :class="['filter-btn', { active: activeTab === tab }]"
          @click="activeTab = tab"> {{ tab }}
        </button>
      </div>

      <div class="filter-item">
        <div>
          <label>년도</label>
            <select v-model="selectedYear">
              <option v-for="year in List" :key="year" :value="year">
                {{ year }}년
              </option>
            </select>
        </div>

        <div>
          <label>학기</label>
            <select v-model="selectedSemester">
              <option v-for="semester in List" :key="semester" :value="semester">
                {{ semester }}
              </option>
            </select>
        </div>

        <div>
          <label>이수학점</label>
            <select v-model="selectedCredits">
              <option v-for="credit in List" :key="credit" :value="credit">
                {{ credit }}학점
              </option>
            </select>
        </div> 

        <div>
          <label>학과</label>
            <select v-model="selectedMajor">
              <option v-for="major in List" :key="major" :value="major">
                {{ major }}
              </option>
            </select>
        </div>

        <div>
          <label>학년</label>
            <select v-model="selectedGrade">
              <option v-for="academicYear in List" :key="academicYear" :value="academicYear">
                {{ academicYear }}학년
              </option>
            </select>
        </div>

      </div>

      <div class="search-area input-content">
        <SearchInput v-model="searchInput" :list="state.list" placeholder="강의명 또는 교수명을 입력하세요"
         @update:modelValue="state.currentPage = 1"/>
        <button class="btn search-btn">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> 검색
        </button>
      </div>
    </div>
    <DataTable :columns="['이수구분', '전공명', '강의명','교수명','강의실','강의시간','이수학점','대상학년']"
      :rows="pagedList" gridCols="80px 150px 3fr 100px 2fr 150px 80px 80px" :isLoading="state.isLoading" emptyMessage="조회된 계정이 없습니다.">
      <article class="tbl-row" v-for="item in pagedList" :key="item.lectureId" @click="moveToDetail(item.lectureId)">
        <div>{{item.lectureType}}</div>
        <div>{{item.majorName}}</div>
        <div>{{item.lectureName}}</div>
        <div>{{item.proName}}</div>
        <div>{{item.building}}{{ item.roomNumber }}</div>
        <div>{{item.dayOfWeek}} | {{item.startPeriod}}교시~{{item.endPeriod}}교시</div>
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
