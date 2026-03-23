<script setup>
import { useAuthStore } from '@/stores/authentication'; 
import  LectureService  from '@/services/lectureService';
import { reactive, onMounted, computed, ref, watch } from 'vue';
import { useRouter,useRoute } from 'vue-router';
import DataTable from '@/components/common/DataTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import SearchInput from '@/components/util/SearchInput.vue';

const route = useRoute();
const authStore = useAuthStore();
const router=useRouter();

const searchInput = ref('');    // 실제 필터링 기준값 (엔터/버튼 클릭 시만 갱신)
const searchQuery = ref('');    // 검색창 입력값 (타이핑할 때마다 바뀜)

const state = reactive({
  list: [],
  isLoading: false,
  pageGroupSize: 10,
  size: 10,
  currentPage: 1,
  maxPage: 0,
  semesterList: [1, 2] // 학기 리스트 고정
});

// 현재 연도 및 학기 계산 함수
const getCurrentTerm = () => {
  const now = new Date();
  const year = now.getFullYear().toString(); 
  const month = now.getMonth() + 1;
  const semester = (month >= 3 && month <= 8) ? 1 : 2;
  return { year, semester };
};

// 데이터 기반 연도 리스트 추출
const yearList = computed(() => {
  const years = state.list.map(item => item.year).filter(Boolean);
  return [...new Set(years)].sort((a, b) => b - a);
});

///////////////// filter / tab /////////////////
const activeTab = ref('전체');
const tabs = ['전체', '대기', '승인', '반려'];
const filter = reactive({
  status: '', // 필터-탭
  page: 1
})



// 탭 클릭시 filter.status 직접 변경
const onTabClick = (tab) => {
  activeTab.value = tab
  if (tab === '전체') filter.status = ''
  else if (tab === '승인') filter.status = 'approved'
  else if (tab === '대기') filter.status = 'pending'
  else if (tab === '반려') filter.status = 'rejected'
  state.currentPage = 1
}

// 3. 필터 초기화 로직 (현재 날짜 반영)
const initFilter = () => {
  const query = route.query;
  const { year: curYear, semester: curSemester } = getCurrentTerm();

  filter.selectedYear = query.year || curYear;
  filter.selectedSemester = query.semester ? Number(query.semester) : curSemester;
  filter.status = query.status || '';
  searchInput.value = query.search || '';
  searchQuery.value = query.search || '';

  const statusMap = { pending: '대기', rejected: '반려', approved: '승인' };
  activeTab.value = statusMap[query.status] || '전체';

  state.currentPage = query.page ? Number(query.page) : 1;
};

// 데이터 호출 예시
onMounted(async () => {
  initFilter();
  await BeforeLectureList();
});

const BeforeLectureList = async () => {
  state.isLoading = true;
  try {
    const result = await LectureService.getMyLecture();
    const lectureData = result || [];

    const listWithCounts = await Promise.all(
      lectureData.map(async (lecture) => {
        // ✅ 승인된 강의만 studentInfo 호출
        if (lecture.status !== 'approved') {
          return { ...lecture, appliedCount: 0 };
        }
        try {
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
    default:  // 전체
      return {
        colsName: ['이수구분','강의명','교수명','이수학점','강의시간','대상학년','수강인원','강의실','승인상태'],
        cols : '1fr 3fr 1fr 1fr 2fr 1fr 1fr 2fr 1fr'
    } 
  }  
})



const moveToDetail = (id) => {
  router.push({
    path: `/lectures/${id}`,
    query: {
      from: 'admin',
      search: searchInput.value,
      status: filter.status,  // 탭 필터 상태
      page: state.currentPage
    }
  })
};


// 검색 및 필터
const filteredList = computed(() => {
  return state.list.filter(item => {
    const matchSearch =
      !searchInput.value ||
      item.lectureName?.toLowerCase().includes(searchInput.value.toLowerCase())

    const matchStatus =
      !filter.status || item.status === filter.status

    return matchSearch && matchStatus
  })
})

const onSearch = () => {
  searchInput.value = searchQuery.value;
  state.currentPage = 1;
}

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
  router.push({
    path: route.path,
    query: {
      ...route.query,
      page
    }
  });
};

</script>

<template>
  <div class="container">
    <div class="filter-header">
      <div class="tab-area">
        <button v-for="tab in tabs" :key="tab" :class="['filter-btn', { active: activeTab === tab }]"
          @click="onTabClick(tab)"> {{ tab }}
        </button>
      </div>


      <div class="search-area input-content">
        <SearchInput v-model="searchQuery" :list="state.list" labelKey="lectureName" :realtime="false" placeholder="강의명을 입력하세요"
          @select="(item) => { searchInput.value = item.lectureName; searchQuery.value = item.lectureName; state.currentPage = 1; }"
          @enter="onSearch"/>
        <button class="btn search-btn" @click="onSearch">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> 검색
        </button>
      </div>
    </div>

    <div class="data-header">
      전체: {{ filteredList.length }}건
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
        <div v-if="item.status==='approved'">{{ item.appliedCount }}/{{ item.maxStd }}명</div>
        <div v-else>{{ item.maxStd }}명</div>
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
    border-radius: 10%; font-size: 14px; font-weight: 700; text-align: center;
}
.status-badge.pending { background: #fff3e0; color: #ef6c00;}
.status-badge.rejected { background: #ffebee; color: #c62828;}
.status-badge.approved { background-color: #eafdf6; color: #3e9e7e;}
</style>