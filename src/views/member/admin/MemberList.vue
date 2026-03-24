<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue';
import memberService from '@/services/memberService';
import DataTable from '@/components/common/DataTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import majorService from '@/services/majorService';
import { useAuthStore } from '@/stores/authentication';
import { useModalStore } from '@/stores/modal';
import { useDebounceFn } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router';
import { formatTel } from '@/utils/phoneNumber'
import { statusKorean } from '@/utils/memberStatus' // 계정 상태 한글 표기

const modal = useModalStore();
const authStore = useAuthStore()
const route = useRoute();
const router = useRouter();
const isLoading = ref(false)// 로딩

const state = reactive({
  list: [],
  majorList: [],
  size: 10,
  isLoading: false,
  currentPage: 1,
  pageGroupSize: 10, // 한그룹에 페이지 번호 몇개 할지 paging 그룹의 번호 갯수
  maxPage: 0, // page 최대값 초기화
  totalCount:0
})

// 수정모드
const ModifyMode = computed(() => route.path === '/admin/members/mod')

///////////////// filter / tab /////////////////
const activeTab = ref('전체');
const tabs = ['전체', '학생', '교수', '직원'];
const filter = reactive({
  role: '', // 필터-탭
  majorName: '', // 필터-검색
  memberName: '', //필터-이름
  page: 1
})

//////////////// 멤버 목록 데이터 가져오는 통신
const getMemberList = async () => {
  state.list = []
  const params = {
    page: state.currentPage,
    size: state.size,
    role: filter.role,
    majorName: filter.majorName,
    memberName: filter.memberName
  }

  try {
    state.isLoading = true // 로딩중
    const res = await memberService.findAllMember(params);
    state.list = res.result;
  } catch (e) { console.error(e) }
  finally {
    state.isLoading = false // 데이터 불러오기 끝
  }
}

// 연도만 추출
const onlyYear = date => date ? date.substr(0, 4) : '-'

// 검색어 입력 시 0.3초 동안 추가 입력 없으면 목록 조회 (debounce)
const debouncedFiltering = useDebounceFn(() => {
  getMemberList()
}, 300)

// 목록에서 상태만 수정
const modStatusList = async () => {
  if (!await modal.showConfirm('수정하시겠습니까?', 'info')) return;
  // memberId랑 바뀐 status만 추려서 보내기
  const updateList = state.list.map(item => ({
    memberId: item.memberId,
    role: item.role,
    status: item.stdStatus || item.profStatus || item.stfStatus
  }))
  try {
    state.isLoading = true // 로딩중
    const res = await memberService.modStatusList(updateList)
    await modal.showAlert(res.message, 'success')
    router.push('/admin/members')
  } catch (e) { console.error(e) }
  finally {
    state.isLoading = false // 데이터 불러오기 끝
  }
}

//////////////////////////////// 테이블 설정 ////////////////////////////////
const tableColumns = computed(() => {
  switch (filter.role) {
    case 'student':
      return {
        colName: ['학번', '학과', '이름', '학년', '학기', '상태', '졸업연도', '이메일', '전화번호'],
        cols: '120px 180px 100px 80px 80px 100px 100px 1fr 1fr'
      }
    case 'professor':
      return {
        colName: ['교번', '학과', '이름', '직위', '상태', '퇴임연도', '이메일', '전화번호'],
        cols: '120px 180px 100px 100px 100px 100px 1fr 1fr'
      }
    case 'admin':
      return {
        colName: ['사번', '이름', '상태', '입사연도', '퇴직연도', '이메일', '전화번호'],
        cols: '120px 120px 100px 100px 100px 1fr 1fr'
      }
    default:  // 전체
      return {
        colName: ['교번', '학과', '이름', '유형', '상태', '이메일', '전화번호'],
        cols: '120px 180px 100px 80px 100px 1fr 1fr'
      }
  }
})

//////////////////////////////// 페이징 ////////////////////////////////

const getMemberMaxPage = async () => {
  const params = {
    size: state.size,
    role: filter.role,
    majorName: filter.majorName,
    memberName: filter.memberName
  }
  try {
    isLoading.value = true  // 로딩 시작
    const result = await memberService.getMemberMaxPage(params)
    state.maxPage = result.result.maxPage
    state.totalCount = result.result.totalCount
  } catch (e) { console.error(e) }
   finally {
    isLoading.value = false  // 로딩 끝 (성공/실패 상관없이)
  }
}

const goToPage = page => {
  state.currentPage = page;
  getMemberList()
}


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
  getMemberMaxPage()
  debouncedFiltering()
})

// (라이프사이클) 페이지 들어왔을 때 목록 조회
onMounted(async () => {
  // await axios.get('/members/test-error') // 테스트용
  const res = await majorService.listForCreate();
  state.majorList = res.result;
  getMemberMaxPage()
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

      <div class="search-area filter-group">
        <div class="input-wrap">
          <div class="input-label">학과</div>
          <div class="input-content">
            <label> <!-- select 학과 검색 -->
              <select v-model="filter.majorName" :class="{ active: filter.majorName !== '' }">
                <option value="">학과 선택</option>
                <option v-for="major in state.majorList" :key="major.majorName" :value="major.name">{{ major.name }}
                </option>
              </select>
            </label>
          </div>
        </div>
        <div class="input-content">
          <label> <!-- input 이름 검색 -->
            <input v-model="filter.memberName" type="text" placeholder="이름 검색" />
          </label>
        </div>
        <button class="btn search-btn" @click="getMemberList()"><font-awesome-icon
            icon="fa-solid fa-magnifying-glass" /> 검색</button>
      </div>
    </div>

    <div class="data-header">
      <div>
        <p>전체: {{ state.totalCount }}명</p>
      </div>
      <div class="d-flex jc-end" v-if="authStore.stfStatus == 'employment'">
        <button class="btn btn-default btn-big" v-if="!ModifyMode"
          @click="router.push('/admin/members/mod')"><font-awesome-icon icon="fa-solid fa-pen-to-square" />
          수정하기</button>
        <button class="btn btn-submit btn-big" v-if="ModifyMode" @click="modStatusList()"><font-awesome-icon
            icon="fa-solid fa-circle-check" /> 저장하기</button>
      </div>
    </div>

    <DataTable :columns="tableColumns.colName" :rows="state.list" :isLoading="state.isLoading"
      :gridCols="tableColumns.cols" emptyMessage="조회된 계정이 없습니다">
      <article class="tbl-row no-hover" v-for="item in state.list" :key="item.code">
        <div>{{ item.code }}</div>
        <div v-if="filter.role == '' || filter.role == 'student' || filter.role == 'professor'">{{ item.stdMajorName ||
          item.profMajorName || '-' }}</div>
        <div>{{ item.name }}</div>
        <div v-if="filter.role == ''">{{ item.role == 'student' ? '학생' : item.role == 'professor' ? '교수' : '직원' }}</div>
        <div v-if="filter.role == 'student'">{{ item.academicYear }}</div>
        <div v-if="filter.role == 'student'">{{ item.semester }}</div>
        <div v-if="filter.role == 'professor'">{{ item.position }}</div>
        <div v-if="!ModifyMode">{{ statusKorean(item) }}</div>
        <div v-if="ModifyMode" class="input-content" @click.stop>
          <select v-if="item.role === 'student'" v-model="item.stdStatus">
            <option value="enrolled">재학</option>
            <option value="absence">휴학</option>
            <option value="graduation">졸업</option>
            <option value="quit">자퇴</option>
            <option value="expulsion">퇴학</option>
          </select>
          <select v-else-if="item.role === 'professor'" v-model="item.profStatus">
            <option value="employment">재직</option>
            <option value="absence">휴직</option>
            <option value="retirement">퇴임</option>
          </select>
          <select v-else v-model="item.stfStatus">
            <option value="employment">재직</option>
            <option value="absence">휴직</option>
            <option value="retirement">퇴사</option>
          </select>
        </div>
        <div v-if="filter.role == 'admin'">{{ onlyYear(item.entryDate) }}</div>
        <div v-if="filter.role == 'student' || filter.role == 'professor' || filter.role == 'admin'">{{
          onlyYear(item.exitDate) }}</div>
        <div>{{ item.email || '-' }}</div>
        <div>{{ formatTel(item.tel) || '-' }}</div>
      </article>
    </DataTable>
    <Pagination :currentPage="state.currentPage" :maxPage="state.maxPage" :pageGroupSize="state.pageGroupSize"
        @goToPage="goToPage" />


  </div>
</template>

<style scoped>
.filter-item .input-content select{min-width: 160px}
</style>
