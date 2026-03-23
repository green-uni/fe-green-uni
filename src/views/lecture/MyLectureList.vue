<script setup>
import { useAuthStore } from '@/stores/authentication';
import LectureService from '@/services/lectureService';
import { reactive, onMounted, computed, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import SearchInput from '@/components/util/SearchInput.vue';

const route = useRoute();
const authStore = useAuthStore();
const router = useRouter();
const searchInput = ref('');    // 실제 필터링 기준값 (엔터/버튼 클릭 시만 갱신)
const searchQuery = ref('');    // 검색창 입력값 (타이핑할 때마다 바뀜)
const state = reactive({
  list: [],
  studentList: [],
  isLoading: false,
  size: 10,
  currentPage: 1,
  maxPage: 0,
  pageGroupSize: 10,
  // 드롭다운에 뿌릴 데이터 리스트
  semesterList: [1, 2],
});

// 현재 연도 및 학기 계산 함수 추가
const getCurrentTerm = () => {
  const now = new Date();
  const year = now.getFullYear().toString(); 
  const month = now.getMonth() + 1;
  const semester = (month >= 3 && month <= 8) ? 1 : 2;

  return { year, semester };
};
// 연도 리스트를 데이터(state.list)에서 추출 (computed)
const yearList = computed(() => {
    const years = state.list
    .map(item => item.year)
    .filter(Boolean);

  const uniqueYears = [...new Set(years)];
  const currentYear = new Date().getFullYear().toString(); // 문자열 맞춰주기

  // 👉 현재 연도 없으면 추가
  if (!uniqueYears.includes(currentYear)) {
    uniqueYears.push(currentYear);
  }
  return uniqueYears.sort((a, b) => b - a);//sort로 내림차순 정렬하여 최신 연도가 위로 오도록
});



///////////////// filter / tab /////////////////
const activeTab = ref('전체');
const tabs = ['전체', '대기','승인', '반려'];
const filter = reactive({
  status: '', // 필터-탭
  page: 1,
  selectedYear: '',
  selectedSemester: ''
})

// 데이터 호출 예시
onMounted(async () => {
  const query = route.query;
  const { year: curYear, semester: curSemester } = getCurrentTerm();
  // URL에 쿼리가 없으면 현재 연도/학기로 replace
  if (Object.keys(query).length === 0) {
    router.replace({
      path: route.path,
      query: {
        year: curYear,
        semester: curSemester,
        status: '',
        search: ''
      }
    });
  }

  // URL 쿼리 파라미터가 있다면 필터 상태(state 또는 filter)에 복구
  if (query.search) {
    searchInput.value = query.search;
    searchQuery.value = query.search;
  }
  if (query.status) filter.status = query.status;
  
  // 탭도 동기화
  if (query.status === 'approved') activeTab.value = '승인'
  else if (query.status === 'pending') activeTab.value = '대기'
  else if (query.status === 'rejected') activeTab.value = '반려'
  BeforeLectureList();
});

// (WATCH) 탭 변경했을 때 filter에 값 저장
watch(activeTab, (tab) => {
  if (tab === '전체') { filter.status = '' }
  else if (tab === '승인') filter.status = 'approved'
  else if (tab === '대기') filter.status = 'pending'
  else if (tab === '반려') filter.status = 'rejected'
})

// (WATCH) route.query 감시하여 뒤로가기/앞으로가기 대응
  watch(() => route.query, (newQuery) => {
    const { year: curYear, semester: curSemester } = getCurrentTerm();

    // URL에 쿼리가 아예 없는 초기 진입
    if (Object.keys(newQuery).length === 0) {
      filter.selectedYear = curYear;       // 2026
      filter.selectedSemester = curSemester; // 1
      return;
    }
      // 키가 존재하면 그 값 그대로, 없으면 현재 연도/학기
      filter.selectedYear = 'year' in newQuery ? newQuery.year : curYear;
      filter.selectedSemester = 'semester' in newQuery 
      ? (newQuery.semester ? Number(newQuery.semester) : '')  // 빈값이면 '' (전체)
      : curSemester;
      searchInput.value = newQuery.search || '';
      searchQuery.value = newQuery.search || '';
    
  },{ immediate: true, deep: true });

const onSearch = () => {
  searchInput.value = searchQuery.value; 
  state.currentPage = 1;
  router.push({
    path: route.path,
    query: {
      year: filter.selectedYear??'' ,
      semester: filter.selectedSemester??'',
      status: filter.status,
      search: searchInput.value  // 갱신된 값으로 push
    }
  });
};

const BeforeLectureList = async () => {
  state.isLoading = true;
  try {
    const result = await LectureService.getMyLecture();
    console.log("서버에서 온 데이터:", result);
    state.list = result || [];

    // 각 강의별로 학생 수를 가져와서 데이터에 합치기
    const listWithCounts = await Promise.all(
      state.list.map(async (lecture) => {
        try {
          // 각 강의 ID로 학생 목록 조회
          const students = await LectureService.findByStudentInfo(lecture.lectureId);
          return {
            ...lecture,
            appliedCount: students ? students.length : 0
          };
        } catch (e) {
          console.error(`${lecture.lectureName} 학생 로드 실패`, e);
          return { ...lecture, appliedCount: 0 };
        }
      })
    );

    state.list = listWithCounts;
  } catch (error) {
    console.error("데이터 매칭 실패:", error);
    state.list = [];
  } finally {
    state.isLoading = false;
  }
};

const tableConfig = computed(() => {
  switch (authStore.role) {
    case 'student':
      return {
        colsName: ['이수구분', '강의명', '교수명', '강의시간', '강의실'],
        cols: '1fr 4fr 2fr 3fr 3fr'
      }
    default:  // 전체
      return {
        colsName: ['이수구분', '강의명', '교수명', '강의시간', '강의실', '이수학점', '대상학년', '수강인원', '승인상태'],
        cols: '70px 5fr 2fr 3fr 3fr 70px 70px 70px 70px'
      }
  }
})


const moveToDetail = (id) => {
  router.push({
    path: `/lectures/my/${id}`,
    query: {
      from: 'my',
      year: filter.selectedYear,
      semester: filter.selectedSemester,
      search: searchInput.value,
      status: filter.status  // 탭 필터 상태
    }
  })
};

// 검색 및 필터
const filteredList = computed(() => {
  return state.list.filter(item => {
    const matchSearch =
      !searchInput.value ||
      item.lectureName?.toLowerCase().includes(searchInput.value.toLowerCase())

    const matchStatus = !filter.status || item.status === filter.status
    const matchYear = !filter.selectedYear || item.year == filter.selectedYear
    const matchSemester = !filter.selectedSemester || item.semester == filter.selectedSemester

    return matchSearch && matchStatus && matchYear && matchSemester
  })
})

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
    <div class="filter-header" >
        <div class="tab-area" v-if="authStore.role === 'professor'">
          <button v-for="tab in tabs" :key="tab" :class="['filter-btn', { active: activeTab === tab }]"
            @click="activeTab = tab"> {{ tab }}
          </button>
        </div>

      <div class="d-flex g10" :class="{ full: authStore.role !== 'professor' }">
      <div class="filter-group">
        <div class="filter-item">
          <div class="input-label">연도</div>
          <div class="input-content">
            <select v-model="filter.selectedYear" @change="onSearch">
              <option value="">전체</option>
              <option v-for="year in yearList" :key="year" :value="year">
                {{ year }}년
              </option>
            </select>
          </div>
        </div>
        <div class="filter-item">
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
        </div>
      <div class="search-area input-content">
        <SearchInput 
          v-model="searchQuery" 
          :list="state.list" 
          labelKey="lectureName"
          :realtime="false" 
          placeholder="강의명을 입력하세요"
          @select="(item) => { searchInput.value = item.lectureName; searchQuery.value = item.lectureName; state.currentPage = 1; }"
          @enter="onSearch"/>
        <button class="btn search-btn" @click="onSearch">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> 검색
        </button>
      </div>
      </div>
    </div>

    <div class="data-header">
      전체: {{ filteredList.length }}건
    </div>
    <DataTable :columns="tableConfig.colsName" :rows="pagedList" :gridCols="tableConfig.cols"
      :isLoading="state.isLoading" emptyMessage="조회된 강의가 없습니다.">

      <article class="tbl-row" v-for="item in pagedList" :key="item.lectureId" @click="moveToDetail(item.lectureId)">
        <div>{{ item.lectureType }}</div>
        <div>{{ item.lectureName }}</div>
        <div>{{ item.proName }}</div>
        <div>{{ item.dayOfWeek }} {{ item.startPeriod }}교시~{{ item.endPeriod  }}교시</div>
        <div>{{ item.building }} {{ item.roomNumber }}</div>
        <div v-if="authStore.role === 'professor'">{{ item.credit }}</div>
        <div v-if="authStore.role === 'professor'">{{ item.academicYear }}학년</div>
        <div v-if="authStore.role === 'professor'">{{ item.appliedCount }}/{{ item.maxStd }}</div>
        <div v-if="authStore.role === 'professor'">
          <span :class="['status-badge', item.status]">
            {{ item.status === 'pending' ? '대기' : item.status === 'approved' ? '승인' : '반려' }}
          </span>
        </div>
      </article>
    </DataTable>
    <Pagination :currentPage="state.currentPage" :maxPage="maxPage" :pageGroupSize="state.pageGroupSize"
      @goToPage="goToPage" />

  </div>
</template>

<style scoped>
.tbl-row {cursor: pointer;}
.filter-header .full{justify-content: space-between;width: 100%;}

.status-badge {
    display: inline-block;
    border-radius: 10%; font-size: 14px; font-weight: 700; text-align: center;
}

.status-badge.pending { background: #fff3e0; color: #ef6c00;}
.status-badge.rejected { background: #ffebee; color: #c62828;}
.status-badge.approved { background-color: #eafdf6; color: #3e9e7e;}
</style>
