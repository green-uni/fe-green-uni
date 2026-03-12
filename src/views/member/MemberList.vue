<script setup>
import memberService from '@/services/memberService';
import SectionTitle from '@/components/common/SectionTitle.vue';
import { ref, onMounted, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

const state = reactive({
  list: [],
  size: 30,
  currentPage: 1,
  maxPage: 0
})


const getMemberList = async () => {
  const params = {
    page: state.currentPage,
    size: state.size
  }
  const res = await memberService.findAllMember(params);
  state.list = res.result;
}

onMounted(() => {
  getMemberList()
})



//// filter tab 버튼
const activeTab = ref('전체'); // '전체', '정상', '폐지'
const tabs = ['전체', '학생', '교수', '직원'];
const searchKeyword = ref('');
const searchInput = ref('');

const filteredList = computed(() => {
  let list = state.list;

  // 탭 필터링
  if (activeTab.value === '학생') {
    list = list.filter(tab => tab.active === 'student');
  } else if (activeTab.value === '교수') {
    list = list.filter(tab => tab.active === 'professor');
  } else if (activeTab.value === '직원') {
    list = list.filter(tab => tab.active === 'admin');
  }

  // // 검색 필터링
  // if (searchKeyword.value.trim()) {
  //   const keyword = searchKeyword.value.trim().toLowerCase();
  //   list = list.filter(item =>
  //     item.name?.toLowerCase().includes(keyword) ||
  //     item.college?.toLowerCase().includes(keyword) ||
  //     item.room?.toLowerCase().includes(keyword) ||
  //     item.chairProfessor?.toLowerCase().includes(keyword)
  //   );
  // }

  return list;
});




</script>

<template>
  <div class="container">

    <!-- 탭 + 검색 바 -->
    <div class="content-header">
      <div class="filter-area">
        <button v-for="tab in tabs" :key="tab" :class="['filter-btn', { active: activeTab === tab }]"
          @click="activeTab = tab">
          {{ tab }}
        </button>
      </div>

      <div class="search-area">
        <input v-model="searchInput" type="text" placeholder="검색어를 입력하세요" class="input-box" @keydown="keydown" />
        <button class="btn search-btn" @click="handleSearch">
          검색
        </button>
      </div>
    </div>

    <section class="tbl-wrap">
      <article class="tbl-head">
        <div>교번</div>
        <div>학과</div>
        <div>이름</div>
        <div>상태</div>
        <div>입사연도</div>
        <div>퇴직연도</div>
        <div>이메일</div>
        <div>전화번호</div>
      </article>
      <article class="tbl-row" v-for="item in state.list" :key="item.code">
        <div>{{ item.code }}</div>
        <div>{{ item.stdMajorName }}{{ item.profMajorName }}</div>
        <div>{{ item.name }}</div>
        <div>{{ item.stdStatus }}{{ item.profStatus }}{{ item.stfStatus }}</div>
        <div>{{ item.entryDate }}</div>
        <div>{{ item.exitDate }}</div>
        <div>{{ item.email ? item.email : '-' }}</div>
        <div>{{ item.tel ? item.tel : '-' }}</div>
      </article>
      <article v-if="state.list.length === 0" class="no-data">
        <p>조회된 계정이 없습니다.</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
/* table의 column 갯수와 크기는 아래와 같이 설정 */
.tbl-wrap{
  --grid-cols: 120px 150px 100px 80px 200px 200px 1fr 1fr
  }
</style>
