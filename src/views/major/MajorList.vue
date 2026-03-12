<script setup>
import majorService from '@/services/majorService';
import { ref, onMounted, computed } from 'vue';
import DataTable from '@/components/common/DataTable.vue';
import { useRouter } from 'vue-router';
const router = useRouter();

// 상태 관리
const majorList = ref([]);
const activeTab = ref('전체'); // '전체', '정상', '폐지'
const searchKeyword = ref('');
const searchInput = ref('');

const tabs = ['전체', '정상', '폐지'];

const filteredList = computed(() => {
  let list = majorList.value;

  // 탭 필터링
  if (activeTab.value === '정상') {
    list = list.filter(item => item.active === 'running');
  } else if (activeTab.value === '폐지') {
    list = list.filter(item => item.active === 'closed');
  }
  /*
  if (activeTab.value !== '전체') {
    list = list.filter(item => item.active === activeTab.value);
  } -> active 값이 running이랑 closed가 아닌 정상, 폐지로 되어 있다면
   */

  // 검색 필터링
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

// 학과 목록 불러오기
const fetchMajorList = async () => {
  try {
    const res = await majorService.majorList();
    // 백엔드 응답에 status 필드가 없을 경우 임시로 매핑 (실제 API에 맞게 수정)
    majorList.value = res.result ?? res ?? [];
  } catch (e) {
    console.error('학과 목록 조회 실패', e);
  }
};

// 검색 실행
const search = () => {
  searchKeyword.value = searchInput.value;
};

// 엔터 검색
const keydown = (e) => {
  if (e.key === 'Enter') search();
};

onMounted(() => {
  fetchMajorList();
});

const goToEdit = (majorId) => {
  router.push(`/admin/major/new/${majorId}`);
};
</script>

<template>
  <div class="container">
    <!-- 탭 + 검색 바 -->
    <div class="filter-header">
      <div class="tab-area">
        <button v-for="tab in tabs" :key="tab" :class="['filter-btn', { active: activeTab === tab }]"
          @click="activeTab = tab">
          {{ tab }}
        </button>
      </div>

      <div class="search-area">
        <input v-model="searchInput" type="text" placeholder="검색어를 입력하세요" class="input-box" @keydown="keydown" />
        <button class="btn search-btn" @click="handleSearch">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> 검색
        </button>
      </div>
    </div>


    <DataTable :columns="['학과명','소속대학','사무실','전화번호','학과장','전임교수','입학정원','상태']"
      :rows="filteredList" gridCols="250px 150px 200px 200px 100px 1fr 1fr 1fr" emptyMessage="조회된 학과가 없습니다.">
      <article class="tbl-row" v-for="(item, idx) in filteredList" :key="item.majorId ?? idx"
        :class="{ 'row-disabled': item.active === 'closed' }" @click="goToEdit(item.majorId)" style="cursor: pointer;">
        <div>{{ item.name }}</div>
        <div>{{ item.college }}</div>
        <div>{{ item.room }}</div>
        <div>{{ item.tel }}</div>
        <div>{{ item.chairProfessor }}</div>
        <div>{{ item.professorCount }}</div>
        <div>{{ item.capacity }}</div>
        <div>
          <span :class="['status-badge', item.active === 'closed' ? 'badge-closed' : 'badge-running']">
            {{ item.active ?? 'running' }}
          </span>
        </div>
      </article>
    </DataTable>
  </div>
</template>

<style scoped>
</style>
