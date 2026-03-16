<script setup>
import majorService from '@/services/majorService';
import { ref, onMounted, reactive, computed, watch } from 'vue';
import DataTable from '@/components/common/DataTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import { formatTel } from '@/utils/phoneNumber';
import { useRouter } from 'vue-router';
const router = useRouter();

// 1. 상태 관리
const state = reactive({
  originList: [],
  isLoading: false,
  size: 5,
  currentPage: 1,
  pageGroupSize: 3
});

const activeTab = ref('전체');
const searchInput = ref('');     // 입력창
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

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();
    list = list.filter(item =>
      item.name?.toLowerCase().includes(keyword) ||
      item.college?.toLowerCase().includes(keyword) ||
      item.room?.toLowerCase().includes(keyword) ||
      item.chairProfessor?.toLowerCase().includes(keyword)
    );
  }
  return list;
});

// 4. 페이징 처리된 리스트 (DataTable에 뿌릴 데이터)
const pagedList = computed(() => {
  const start = (state.currentPage - 1) * state.size;
  const end = start + state.size;
  return filteredList.value.slice(start, end);
});

// 5. 최대 페이지 수 계산
const maxPage = computed(() => {
  return Math.ceil(filteredList.value.length / state.size) || 1;
});

// 데이터 호출
const fetchMajorList = async () => {
  state.isLoading = true;
  try {
    const res = await majorService.majorList();
    state.originList = res.result ?? res ?? [];
  } catch (e) {
    console.error('학과 목록 조회 실패', e);
  } finally {
    state.isLoading = false;
  }
};

const handleSearch = () => {
  searchKeyword.value = searchInput.value;
  state.currentPage = 1; // 검색 시 1페이지로 이동
};

const goToPage = (page) => {
  state.currentPage = page;
};

// 필터 변경 시 페이지 초기화
watch([activeTab, selectedCollege], () => {
  state.currentPage = 1;
});

onMounted(() => {
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

      <div class="filter-group">
        <div class="filter-item">
          <label>대학</label>
          <select v-model="selectedCollege">
            <option v-for="college in collegeList" :key="college" :value="college">
              {{ college }}
            </option>
          </select>
        </div>

        <div class="search-area input-content">
          <input v-model="searchInput" type="text" placeholder="검색어를 입력하세요" class="input-box" 
            @keydown.enter="handleSearch" />
          <button class="btn search-btn" @click="handleSearch">
            <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> 검색
          </button>
        </div>
      </div>
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
        <div>{{ item.chairProfessor }}</div>
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
      :maxPage="maxPage" 
      :pageGroupSize="state.pageGroupSize"
      @goToPage="goToPage" 
    />
  </div>
</template>

<style scoped>
</style>
