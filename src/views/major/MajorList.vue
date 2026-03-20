<script setup>
import majorService from '@/services/majorService';
import { ref, onMounted, reactive, computed, watch } from 'vue';
import DataTable from '@/components/common/DataTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import { formatTel } from '@/utils/phoneNumber';
import { useRouter } from 'vue-router';
import SearchInput from '@/components/util/SearchInput.vue';

const router = useRouter();

// 1. 상태 관리
const state = reactive({
  originList: [],
  isLoading: false,
  size: 5,
  currentPage: 1,
  pageGroupSize: 3,
  totalCount:0,
  maxPage: 1
});

const activeTab = ref('전체');
const searchKeyword = ref('');   // 실제 검색어
const selectedCollege = ref('전체');

const tabs = ['전체', '정상', '폐지'];

// 2. 단과대 목록 추출 (전체 데이터 기반)
const collegeList = computed(() => {
  const colleges = state.originList.map(item => item.college);
  return ['전체', ...new Set(colleges)].filter(Boolean);
});

// 3. 필터링 로직 (탭 + 단과대 + 검색어)
const filteredList = computed(() => {
  let list = [...state.originList];

  if (activeTab.value === '정상') list = list.filter(item => item.active === 'running');
  else if (activeTab.value === '폐지') list = list.filter(item => item.active === 'closed');

  if (selectedCollege.value !== '전체') {
    list = list.filter(item => item.college === selectedCollege.value);
  }

  return list;
});

// 4. 페이징 처리된 리스트 (DataTable에 뿌릴 데이터)
const pagedList = computed(() => {
  const start = (state.currentPage - 1) * state.size;
  const end = start + state.size;
  return filteredList.value.slice(start, end);
});

// 데이터 호출
const fetchMajorList = async () => {
  state.isLoading = true;

  let statusValue = '';
  if (activeTab.value === '정상') statusValue = 'running';
  else if (activeTab.value === '폐지') statusValue = 'closed';
  const params = {
    page: state.currentPage,
    size: state.size,
    active: statusValue,
    college: selectedCollege.value === '전체' ? '' : selectedCollege.value,
    majorName: searchKeyword.value
  };

  try {
    const res = await majorService.majorList(params);
    state.originList = res.result ?? res ?? [];
  } catch (e) {
    console.error('학과 목록 조회 실패', e);
  } finally {
    state.isLoading = false;
  }
};

const handleMajorSelect = (major) => {
  searchKeyword.value = major.name;
  state.currentPage = 1;
};

// 직접 타이핑 후 엔터 등을 쳤을 때를 위한 함수 (필요시)
const onSearchInput = (val) => {
  searchKeyword.value = val;
  state.currentPage = 1;
};

const goToPage = (page) => {
  state.currentPage = page;
};

const getMajorMaxPage = async () => {
  // 탭의 한국어 값을 DB 값으로 매핑
  let statusValue = '';
  if (activeTab.value === '정상') statusValue = 'running';
  else if (activeTab.value === '폐지') statusValue = 'closed';

  const params = {
    size: state.size,
    active: statusValue, // 'running' 또는 'closed' 또는 ''
    collegeName: selectedCollege.value === '전체' ? '' : selectedCollege.value,
    majorName: searchKeyword.value
  }
  
  try {
    state.isLoading = true;
    const res = await majorService.getMajorMaxPage(params); 
    
    // MyBatis Map 반환 시 대문자/소문자 이슈 방지를 위해 안전하게 처리
    const data = res.result ?? res;
    if (data) {
      // 키값이 대문자로 올 수도 있으므로 확인 (MAXPAGE / maxPage)
      state.totalCount = data.totalCount ?? data.TOTALCOUNT ?? 0; 
      state.maxPage = data.maxPage ?? data.MAXPAGE ?? 1;
    }
  } catch (e) {
    console.error('페이지 정보 조회 실패', e);
  } finally {
    state.isLoading = false;
  }
}

// 필터 변경 시 페이지 초기화
watch([activeTab, selectedCollege, searchKeyword], () => {
  state.currentPage = 1;
  getMajorMaxPage();
  fetchMajorList();
});

watch(() => state.currentPage, () => {
  fetchMajorList();
});

onMounted(() => {
  getMajorMaxPage();
  fetchMajorList();
});

const goToEdit = (majorId) => {
  router.push(`/admin/major/new/${majorId}`);
};
</script>

<template>
  <div class="container">
    <div class="filter-header">
      <div class="tab-area">
        <button v-for="tab in tabs" :key="tab" :class="['filter-btn', { active: activeTab === tab }]"
          @click="activeTab = tab">
          {{ tab }}
        </button>
      </div>

      <div class="filter-group ">
        <div class="filter-item">
          <div class="input-label">대학</div>
            <div class="input-content">
            <select v-model="selectedCollege" class="college-select">
              <option v-for="college in collegeList" :key="college" :value="college">
                {{ college }}
              </option>
            </select>
          </div>
        </div>
        <div class="search-area">
        <div class="input-content" style="width: 300px;">
          <SearchInput 
            v-model="searchKeyword" 
            :list="state.originList" 
            placeholder="학과명을 입력하세요"
            @select="handleMajorSelect"
            @update:modelValue="onSearchInput" 
          />
        </div>
        <button class="btn search-btn" @click="state.currentPage = 1; fetchMajorList();">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> 검색
        </button>
      </div>
      </div>
    </div>

    <div>
        <p>전체: {{ state.totalCount }}개</p>
    </div>

    <DataTable
      :columns="['학과명','소속대학','사무실','전화번호','학과장','전임교수','입학정원','상태']"
      :rows="pagedList"
      :isLoading="state.isLoading"
      gridCols="1fr 100px 1fr 200px 100px 80px 100px 100px"
      emptyMessage="조회된 학과가 없습니다.">

      <article class="tbl-row pointer" v-for="(item, idx) in pagedList" :key="item.majorId ?? idx"
        :class="{ 'row-disabled': item.active === 'closed' }" @click="goToEdit(item.majorId)">
        <div>{{ item.name }}</div>
        <div>{{ item.college }}</div>
        <div>{{ item.room }}</div>
        <div>{{ formatTel(item.tel) }}</div>
        <div>{{ item.chairProfessorName }}</div>
        <div>{{ item.professorCount }}</div>
        <div>{{ item.capacity }}</div>
        <div>
          <span :class="['status-badge', item.active === 'closed' ? 'badge-closed' : 'badge-running']">
            {{ item.active === 'closed' ? '폐지' : '정상' }}
          </span>
        </div>
      </article>
    </DataTable>

    <Pagination
      :currentPage="state.currentPage"
      :maxPage="state.maxPage"
      :pageGroupSize="state.pageGroupSize"
      @goToPage="goToPage"
    />
  </div>
</template>

<style scoped>
.college-select {
  width: 160px;
  min-width: 160px;
}
</style>
