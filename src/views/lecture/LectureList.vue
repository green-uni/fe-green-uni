<script setup>
import LectureService from '@/services/lectureService';
import { onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import DataTable from '@/components/common/DataTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import SearchInput from '@/components/util/SearchInput.vue';
import { ref, watch } from 'vue';

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
  // 드롭다운에 뿌릴 데이터 리스트 (직접 정의)
  yearList: ['2024', '2025', '2026'],
  semesterList: [1, 2],
});

const filter = reactive({
  selectedYear: 2026,
  selectedSemester: '',
  selectedLectureType: '',
  selectedCredits: '',
  selectedMajor: '',
  selectedAcademicYear: '',
});

onMounted(async () => {
  // URL 쿼리 파라미터가 있다면 필터 상태(state 또는 filter)에 복구
  const query = route.query;
  if (Object.keys(query).length > 0) {
    filter.selectedYear = query.year || 2026;
    filter.selectedSemester = query.semester || '';
    filter.selectedLectureType = query.lectureType || '';
    filter.selectedCredits = query.credit || '';
    filter.selectedMajor = query.major || '';
    filter.selectedAcademicYear = query.academicYear || '';
    searchInput.value = query.search || '';
  }

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

const onSearch = () => {
  router.push({
    path: route.path,
    query: {
      selectedYear: filter.selectedYear,
      selectedSemester: filter.selectedSemester,
      selectedLectureType: filter.selectedLectureType,
      selectedCredits: filter.selectedCredits,
      selectedMajor: filter.selectedMajor,
      selectedAcademicYear: filter.selectedAcademicYear,
      search: searchInput.value
    }
  });
  state.currentPage = 1;
};

// route.query(주소창의 파라미터)가 바뀔 때마다 실행됨
watch(() => route.query, (newQuery) => {
  if (Object.keys(newQuery).length > 0) {
    // 주소창의 값을 다시 filter 객체에 복구
    filter.selectedYear = newQuery.selectedYear || 2026;
    filter.selectedSemester = newQuery.selectedSemester || '';
    filter.selectedLectureType = newQuery.selectedLectureType || '';
    filter.selectedCredits = newQuery.selectedCredits || '';
    filter.selectedMajor = newQuery.selectedMajor || '';
    filter.selectedAcademicYear = newQuery.selectedAcademicYear || '';
    searchInput.value = newQuery.search || '';
  } else {
    // 쿼리가 없으면 필터 초기화 (전체보기 상태)
    Object.keys(filter).forEach(key => {
      filter[key] = (key === 'selectedYear') ? 2026 : '';
    });
    searchInput.value = '';
  }
}, { immediate: true, deep: true });

const id = route.params.lectureId;
const moveToDetail = (id) => {
  console.log("이동하려는 강의 ID:", id);
  router.push({
    path: `/lectures/${id}`,
    query: { //현재 필터 상태를 query로 넘기기
      year: filter.selectedYear,
      semester: filter.selectedSemester,
      lectureType: filter.selectedLectureType,
      credit: filter.selectedCredits,
      major: filter.selectedMajor,
      academicYear: filter.selectedAcademicYear,
      search: searchInput.value
    }
  });
};


const creditList = computed(() => [...new Set(state.list.map(i => i.credit).filter(Boolean))].sort());
const majorList = computed(() => [...new Set(state.list.map(i => i.majorName).filter(Boolean))].sort());
const academicYearList = computed(() => [...new Set(state.list.map(i => i.academicYear).filter(Boolean))].sort());
const lectureTypeList = computed(() => [...new Set(state.list.map(i => i.lectureType).filter(Boolean))].sort());

// 검색어에 따라 리스트 필터링
const filteredList = computed(() => {

  let list = state.list;

  //필터 및 검색기능 관련
  if (filter.selectedYear) list = list.filter(i => i.year == filter.selectedYear);
  if (filter.selectedSemester) list = list.filter(i => i.semester == filter.selectedSemester);
  if (filter.selectedLectureType) list = list.filter(i => i.lectureType == filter.selectedLectureType);
  if (filter.selectedCredits) list = list.filter(i => i.credit == filter.selectedCredits);
  if (filter.selectedMajor) list = list.filter(i => i.majorName === filter.selectedMajor);
  if (filter.selectedAcademicYear) list = list.filter(i => i.academicYear == filter.selectedAcademicYear);
  if (searchInput.value) {
    const keyword = searchInput.value.toLowerCase();
    list = list.filter(i =>
      i.lectureName?.toLowerCase().includes(keyword) ||
      i.proName?.toLowerCase().includes(keyword)
    );
  }
  return list;
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
      <div class="filter-item">
        <div class="input-wrap">
          <div class="input-label">학과</div>
          <div class="input-content">
            <select v-model="filter.selectedYear" @change="onSearch">
              <option value="">전체</option>
              <option v-for="year in state.yearList" :key="year" :value="year">
                {{ year }}년
              </option>
            </select>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">학기</div>
          <div class="input-content">
            <select v-model="filter.selectedSemester" @change="onSearch">
              <option value="">전체</option>
              <option v-for="semester in state.semesterList" :key="semester" :value="semester">
                {{ semester }}학기
              </option>
            </select>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">구분</div>
          <div class="input-content">
            <select v-model="filter.selectedLectureType" @change="onSearch">
              <option value="">전체</option>
              <option v-for="type in lectureTypeList" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">이수학점</div>
          <div class="input-content">
            <select v-model="filter.selectedCredits" @change="onSearch">
              <option value="">전체</option>
              <option v-for="credit in creditList" :key="credit" :value="credit">
                {{ credit }}학점
              </option>
            </select>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">학과</div>
          <div class="input-content">
            <select v-model="filter.selectedMajor" @change="onSearch">
              <option value="">전체</option>
              <option v-for="major in majorList" :key="major" :value="major">
                {{ major }}
              </option>
            </select>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">학년</div>
          <div class="input-content">
            <select v-model="filter.selectedAcademicYear" @change="onSearch">
              <option value="">전체</option>
              <option v-for="academicYear in academicYearList" :key="academicYear" :value="academicYear">
                {{ academicYear }}학년
              </option>
            </select>
          </div>
        </div>
        </div>
      <div class="search-area filter-item">
          <div class="input-content">
            <SearchInput v-model="searchInput" :list="state.list" placeholder="강의명 또는 교수명"
              @update:modelValue="state.currentPage = 1" />
          </div>
            <button class="btn search-btn" @change="onSearch">
              <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> 검색
            </button>
        </div>
    </div>
    <DataTable :columns="['이수구분', '전공명', '강의명', '교수명', '강의실', '강의시간', '이수학점', '대상학년']" :rows="pagedList"
      gridCols="70px 150px 3fr 80px 2fr 150px 70px 70px" :isLoading="state.isLoading" emptyMessage="조회된 계정이 없습니다.">
      <article class="tbl-row" v-for="item in pagedList" :key="item.lectureId" @click="moveToDetail(item.lectureId)">
        <div>{{ item.lectureType }}</div>
        <div>{{ item.majorName }}</div>
        <div>{{ item.lectureName }}</div>
        <div>{{ item.proName }}</div>
        <div>{{ item.building }}{{ item.roomNumber }}</div>
        <div>{{ item.dayOfWeek }} | {{ item.startPeriod }}교시~{{ item.endPeriod }}교시</div>
        <div>{{ item.credit }}</div>
        <div>{{ item.academicYear }}</div>
      </article>
    </DataTable>
    <Pagination :currentPage="state.currentPage" :maxPage="maxPage" :pageGroupSize="state.pageGroupSize"
      @goToPage="goToPage" />
  </div>
</template>

<style scoped>
.tbl-row {
  cursor: pointer;
}
</style>
