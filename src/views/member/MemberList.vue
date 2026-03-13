<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue';
import memberService from '@/services/memberService';
import DataTable from '@/components/common/DataTable.vue';
import majorService from '@/services/majorService';
import { useDebounceFn } from '@vueuse/core'

const state = reactive({
  list: [],
  majorList: [],
  size: 30,
  isLoading: false,
  currentPage: 1,
  maxPage: 0
})

//// filter / tab
const activeTab = ref('전체');
const tabs = ['전체', '학생', '교수', '직원'];
const filter = reactive({
  role: '',
  majorName: '',
  memberName: '',
  page: 1
})

const getMemberList = async () => {
  state.isLoading = true // 로딩중
  state.list = []
  const params = {
    page: state.currentPage,
    size: state.size,
    role: filter.role,
    majorName: filter.majorName,
    memberName: filter.memberName
  }
  const res = await memberService.findAllMember(params);
  state.list = res.result;
  state.isLoading = false // 데이터 불러오기 끝
}

// 검색어 입력 시 0.3초 동안 추가 입력 없으면 목록 조회 (debounce)
const debouncedFiltering = useDebounceFn(() => {
  getMemberList()
}, 300)

const tableColumns = computed(() => {
  switch (filter.role) {
    case 'student':
      return ['학번', '학과', '이름', '상태', '입학연도', '졸업연도', '이메일', '전화번호']
    case 'professor':
      return ['교번', '학과', '이름', '상태', '입사연도', '퇴임연도', '이메일', '전화번호']
    case 'admin':
      return ['사번', '학과', '이름', '상태', '입사연도', '퇴직연도', '이메일', '전화번호']
    default:  // 전체
      return ['교번', '학과', '이름', '상태', '입사연도', '퇴직연도', '이메일', '전화번호']
  }
})

// (WATCH) 탭 변경했을 때 filter에 값 저장
watch(activeTab, (tab) => {
  if (tab === '전체') { filter.role = '', filter.majorName = '', filter.memberName = '' }
  else if (tab === '학생') filter.role = 'student'
  else if (tab === '교수') filter.role = 'professor'
  else if (tab === '직원') filter.role = 'admin'
})

// (WATCH) filter 바뀌면 목록 재조회
watch(filter, () => {
  state.currentPage = 1  // 필터 바뀌면 1페이지로 리셋
  debouncedFiltering()
})

// (라이프사이클) 페이지 들어왔을 때 목록 조회
onMounted(async () => {
  const res = await majorService.listForCreate();
  state.majorList = res.result;
  getMemberList()
})
</script>

<template>
  <div class="container">

    <!-- 탭 + 검색 바 -->
    <div class="filter-header">
      <div class="tab-area">
        <button v-for="tab in tabs" :key="tab" :class="['filter-btn', { active: activeTab === tab }]"
          @click="activeTab = tab"> {{ tab }}
        </button>
      </div>

      <div class="search-area input-content">
        <label> <!-- select 학과 검색 -->
          <select v-model="filter.majorName" :class="{ active: filter.majorName !== '' }">
            <option value="">학과 선택</option>
            <option v-for="major in state.majorList" :key="major.majorName" :value="major.name">{{ major.name }}
            </option>
          </select>
        </label>
        <label> <!-- input 이름 검색 -->
          <input v-model="filter.memberName" type="text" placeholder="이름 검색" />
        </label>
        <button class="btn search-btn" @click="getMemberList()"><font-awesome-icon
            icon="fa-solid fa-magnifying-glass" /> 검색</button>
      </div>
    </div>

    <DataTable :columns="tableColumns" :rows="state.list" :isLoading="state.isLoading"
      gridCols="120px 150px 100px 80px 200px 200px 1fr 1fr" emptyMessage="조회된 계정이 없습니다">
      <article class="tbl-row" v-for="item in state.list" :key="item.code">
        <div>{{ item.code }}</div>
        <div>{{ item.stdMajorName || item.profMajorName || '-' }}</div>
        <div>{{ item.name }}</div>
        <div>{{ item.stdStatus || item.profStatus || item.stfStatus }}</div>
        <div>{{ item.entryDate }}</div>
        <div>{{ item.exitDate || '-' }}</div>
        <div>{{ item.email || '-' }}</div>
        <div>{{ item.tel || '-' }}</div>
      </article>
    </DataTable>
  </div>
</template>

<style scoped></style>
