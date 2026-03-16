<script setup>
import courseService from '@/services/courseService';
import { useModalStore } from '@/stores/modal';
import { ref, onMounted, computed } from 'vue';
import DataTable from '@/components/common/DataTable.vue';

const modal = useModalStore();

const courseList = ref([]);
const myCourseData = ref({
  totalEnrolledCredits: 0,
  courses: []
});

const typeTab = ref('전체'); // '전체', '전공', '교양'
const searchKeyword = ref('');
const searchInput = ref('');
const selectedMajor = ref('전체');
const selectedYear = ref('전체');

const tabs = ['전체', '전공', '교양'];

// 1. 학과 목록 자동 추출 (중복 제거)
const majorList = computed(() => {
  // courseList에서 majorName만 뽑아낸 뒤 Set을 이용해 중복 제거
  const majors = courseList.value.map(item => item.majorName);
  return ['전체', ...new Set(majors)].filter(Boolean); // null이나 undefined 제외
});

const filteredList = computed(() => {
  let list = courseList.value;

  // 승인된(approved) 강의만 필터링
  list = list.filter(item => item.status === 'approved');

  //탭(type) 필터링
  if (typeTab.value !== '전체') {
    list = list.filter(item => item.lectureType === typeTab.value);
  }

  // 학과 필터링
  if (selectedMajor.value !== '전체') {
    list = list.filter(item => item.majorName === selectedMajor.value);
  }

  // 학년 필터링
  if (selectedYear.value !== '전체') {
    list = list.filter(item => item.academicYear === Number(selectedYear.value));
  }

  // 검색 필터링
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();
    list = list.filter(item =>
      item.majorName?.toLowerCase().includes(keyword) ||
      item.lectureName?.toLowerCase().includes(keyword) ||
      item.proName?.toLowerCase().includes(keyword)
    );
  }

  return list;
});

// 수강 목록 불러오기
const fetchCourseList = async () => {
  try {
    const res = await courseService.courseList();
    courseList.value = res.result ?? res ?? [];
  } catch (e) {
    console.error('수강신청 목록 조회 실패', e);
  }
};

// 내 수강 목록 불러오기
const fetchMyCourseList = async () => {
  try {
    const res = await courseService.myCourseList();
    if (res && res.result) {
      myCourseData.value = res.result;
    } else if (res) {
      // 혹시 result 없이 바로 데이터가 오는 경우를 대비
      myCourseData.value = res;
    }
  } catch (e) {
    console.error('내 수강 목록 조회 실패', e);
  }
};

// 수강 취소
const courseDelete = async (lectureId) => {
  if (!await modal.showConfirm('수강을 취소하시겠습니까?', 'error')) return;

  try {
    const res = await courseService.courseDel({ lectureId });
    if (res) {
      await modal.showAlert('수강 취소가 완료되었습니다.', 'success');
      await fetchCourseList();
      await fetchMyCourseList();
    }
  } catch (e) {
    console.error('수강 취소 실패', e);
    modal.showAlert('수강 취소 중 오류가 발생했습니다.', 'error');
  }
};

// 이미 신청한 강의인지 확인하는 함수 (computed나 methods)
const isEnrolled = (lectureId) => {
  return myCourseData.value.courses.some(course => course.lectureId === lectureId);
};

// 수강 신청
const enroll = async (lectureId) => {
  if (!modal.showConfirm('해당 강의를 신청하시겠습니까?')) return;

  try {
    const res = await courseService.postCourse({ lectureId });
    if (res) {
      await modal.showAlert('수강 신청이 완료되었습니다.', 'success');
      await fetchCourseList();
      await fetchMyCourseList();
    }
  } catch (e) {
    const errorMsg = e.response?.data?.message || '수강 신청 중 오류가 발생했습니다.'; //e.response?.data?.message: 백엔드에 작성한 수강 오류 상세 원인 불러오기
    modal.showAlert(errorMsg, 'error');
  }
};

// 검색 실행
const search = () => {
  searchKeyword.value = searchInput.value;
};
const keydown = (e) => {
  if (e.key === 'Enter') search();
};

onMounted(() => {
  fetchCourseList();
  fetchMyCourseList();
});
</script>

<template>
  <div class="container">
    <div class="filter-header">
      <div class="tab-area">
        <button v-for="tab in tabs" :key="tab" :class="['filter-btn', { active: typeTab === tab }]"
          @click="typeTab = tab">
          {{ tab }}
        </button>
      </div>
      <div class="filter-group">
        <div class="filter-item">
          <label>학과</label>
            <select v-model="selectedMajor">
              <option v-for="major in majorList" :key="major" :value="major">
                {{ major }}
              </option>
            </select>
        </div>
      
        <div class="filter-item">
          <label>학년</label>
          <select v-model="selectedYear">
            <option value="전체">전체</option>
            <option value="1">1학년</option>
            <option value="2">2학년</option>
            <option value="3">3학년</option>
            <option value="4">4학년</option>
          </select>
        </div>

        <div class="search-area input-content">
          <input v-model="searchInput" type="text" placeholder="검색어를 입력하세요" class="input-box" @keydown="keydown" />
          <button class="btn search-btn" @click="search">검색</button>
        </div>
      </div>
    </div>

    <DataTable :columns="['학과명', '강의명', '강의실', '이수구분', '학년', '담당교수', '수업시간', '학점', '수강인원', '신청']" :rows="filteredList"
      gridCols="1fr 1fr 200px 100px 50px 100px 200px 50px 100px 100px" emptyMessage="조회된 강의가 없습니다.">
      <article class="tbl-row" v-for="(item, idx) in filteredList" :key="item.lectureId ?? idx">
        <div>{{ item.majorName }}</div>
        <div>{{ item.lectureName }}</div>
        <div>{{ item.building }} {{ item.roomNumber }}</div>
        <div>{{ item.lectureType }}</div>
        <div>{{ item.academicYear }}</div>
        <div>{{ item.proName }}</div>
        <div>{{ item.dayOfWeek }} {{ item.startPeriod }} 교시~ {{ item.endPeriod }}교시</div>
        <div>{{ item.credit }}</div>
        <div>{{ item.remStd }}/{{ item.maxStd }}</div>
        <div v-if="isEnrolled(item.lectureId)" class="btn-register-success">신청완료</div>
        <div v-else class="btn-register" @click="enroll(item.lectureId)">수강신청</div>
      </article>
    </DataTable>
  </div>

  <div class="container">
  <div class="my-course-header">
    <h1 style="font-weight: bold;">신청 내역
      <span class="totalCredit">신청 학점: <strong>{{ myCourseData.totalEnrolledCredits }}</strong>학점</span>
    </h1>
  </div>
  <DataTable :columns="['학과명', '강의명', '강의실', '이수구분', '학년', '담당교수', '수업시간', '학점', '수강인원', '신청']" :rows="filteredList"
    gridCols="1fr 1fr 200px 100px 50px 100px 200px 50px 100px 100px" emptyMessage="조회된 강의가 없습니다.">
    <article class="tbl-row" v-for="(item, idx) in myCourseData.courses" :key="item.lectureId ?? idx">
      <div>{{ item.majorName }}</div>
      <div>{{ item.lectureName }}</div>
      <div>{{ item.building }} {{ item.roomNumber }}</div>
      <div>{{ item.lectureType }}</div>
      <div>{{ item.academicYear }}</div>
      <div>{{ item.proName }}</div>
      <div>{{ item.dayOfWeek }} {{ item.startPeriod }}교시~ {{ item.endPeriod }}교시</div>
      <div>{{ item.credit }}</div>
      <div>{{ item.remStd }}/{{ item.maxStd }}</div>
      <div class="btn-register-del" @click="courseDelete(item.lectureId)">수강취소</div>
    </article>
  </DataTable>
  </div>
</template>

<style scoped>
/* 헤더 및 기타 레이아웃 보정 */
.my-course-header {
  margin-top: 40px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--font-color);
}

.totalCredit {
  float: right;
  font-size: var(--text-md);
  color: var(--font-color);
}

.totalCredit strong {
  color: var(--main-color);
  font-size: var(--text-lg);
  margin-left: 5px;
}
</style>
