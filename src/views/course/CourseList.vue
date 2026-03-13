<script setup>
import courseService from '@/services/courseService';
import { ref, onMounted, computed } from 'vue';

const courseList = ref([]);
const myCourseData = ref({
    totalEnrolledCredits: 0,
    courses: []
});

const typeTab = ref('전체'); // '전체', '전공', '교양'
const searchKeyword = ref('');
const searchInput = ref('');

const tabs = ['전체', '전공', '교양'];

const filteredList = computed(() => {
  let list = courseList.value;

  //탭 필터링
  if (typeTab.value !== '전체') {
    list = list.filter(item => item.lectureType === typeTab.value);
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
<div class="content-header">
    <div class="filter-area">
        <button v-for="tab in tabs" :key="tab" :class="['filter-btn', { lectureType: typeTab === tab }]"
          @click="typeTab = tab">
          {{ tab }}
        </button>
    </div>
    <div class="search-area">
        <input v-model="searchInput" type="text" placeholder="검색어를 입력하세요" class="input-box" @keydown="keydown" />
        <button class="btn search-btn" @click="search">검색</button>
    </div>
</div>

<section class="tbl-wrap">
    <article class="tbl-head">
        <div>강의코드</div>
        <div>학과명</div>
        <div>강의명</div>
        <div>강의실</div>
        <div>이수구분</div>
        <div>학년</div>
        <div>담당교수</div>
        <div>수업시간</div>
        <div>학점</div>
        <div>수강인원</div>
        <div>신청</div>
    </article>
    <article class="tbl-row" v-for="(item, idx) in filteredList" :key="item.lectureId ?? idx">
        <div>{{ item.lectureId }}</div>
        <div>{{ item.majorName }}</div>
        <div>{{ item.lectureName }}</div>
        <div>{{ item.building }} {{ item.roomNumber }}</div>
        <div>{{ item.lectureType }}</div>
        <div>{{ item.academicYear }}</div>
        <div>{{ item.proName }}</div>
        <div>{{ item.dayOfWeek }}</div>
        <div>{{ item.credit }}</div>
        <div>{{ item.remStd }}/{{ item.maxStd }}</div>
        <div class="register">수강신청</div>
    </article>
    <article v-if="filteredList.length === 0" class="no-data">
        <div>조회된 학과가 없습니다.</div>
    </article>
</section>

<div class="my-course-header">
    <h3>신청 내역
        <span class="totalCredit">신청 학점: <strong>{{ myCourseData.totalEnrolledCredits }}</strong>학점</span>
    </h3>
</div>
<section class="tbl-wrap">
    <article class="tbl-head">
        <div>강의코드</div>
        <div>학과명</div>
        <div>강의명</div>
        <div>강의실</div>
        <div>이수구분</div>
        <div>학년</div>
        <div>담당교수</div>
        <div>수업시간</div>
        <div>학점</div>
        <div>수강인원</div>
        <div>신청</div>
    </article>
    <article class="tbl-row" v-for="(item, idx) in myCourseData.courses" :key="item.lectureId ?? idx">
        <div>{{ item.lectureId }}</div>
        <div>{{ item.majorName }}</div>
        <div>{{ item.lectureName }}</div>
        <div>{{ item.building }} {{ item.roomNumber }}</div>
        <div>{{ item.lectureType }}</div>
        <div>{{ item.academicYear }}</div>
        <div>{{ item.proName }}</div>
        <div>{{ item.dayOfWeek }}</div>
        <div>{{ item.credit }}</div>
        <div>{{ item.remStd }}/{{ item.maxStd }}</div>
        <div class="register">수강취소</div>
    </article>
    <article v-if="!myCourseData.courses || myCourseData.courses.length === 0" class="no-data">
        <div>조회된 학과가 없습니다.</div>
    </article>
</section>
</template>

<style scoped>
.tbl-wrap { --grid-cols: 1fr 200px 200px 200px 100px 1fr 1fr 1fr 1fr 1fr 1fr}

.register{ cursor: pointer; color: var(--main-color);}
.register:hover{color: var(--hover-color);}

.my-course-header{margin-top: 30px;}
.totalCredit{float: right;}
</style>