<script setup>
  import  LectureService  from '@/services/lectureService';
  import { onMounted, reactive } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authentication';
  import DataTable from '@/components/common/DataTable.vue';


  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const state = reactive({
    list: [],
    lectureList: [],
    relatedSearchList:[],
    selectedIndex: -1,
    size: 30,
    currentPage: 1,
    maxPage: 0,

  });

onMounted(async () => {
  try {
    const res = await LectureService.getLectureList();
    console.log("서버 응답 확인:", res); // 👈 여기서 데이터 구조를 반드시 확인하세요!
    state.list = res || []; // 데이터가 없으면 빈 배열 할당
  } catch (error) {
    console.error("목록 로드 실패:", error);
  }
});

const id=route.params.lectureId;
const moveToDetail = (id) => {
  console.log("이동하려는 강의 ID:", id);
  router.push(`/lectures/${id}`);
};



// 키보드 이벤트 핸들러
  const handleKeydown = (event) => {
    if (state.relatedSearchList.length === 0) return;

    if (event.key === 'ArrowDown') {
      // 아래 화살표: 인덱스 증가
      state.selectedIndex = (state.selectedIndex + 1) % state.relatedSearchList.length;
    } else if (event.key === 'ArrowUp') {
      // 위 화살표: 인덱스 감소
      state.selectedIndex = (state.selectedIndex - 1 + state.relatedSearchList.length) % state.relatedSearchList.length;
    } else if (event.key === 'Enter') {
      // 엔터키: 현재 선택된 항목 확정
      event.preventDefault(); // 폼 제출 방지
      if (state.selectedIndex >= 0) {
        selectLecture(state.relatedSearchList[state.selectedIndex]);
      }
    }
  };

  // ✅ 한글 초성 추출 함수
  const getChosung = (str) => {
    const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
    return [...str].map(ch => {
      const code = ch.charCodeAt(0) - 0xAC00;
      if (code < 0 || code > 11171) return ch;
      return CHO[Math.floor(code / 28 / 21)];
    }).join('');
  };

  const isChosung = (str) => /^[ㄱ-ㅎ]+$/.test(str);

  const searchLecture = () => {
    if (!state.data.lectureName) {
      state.relatedSearchList = [];
      return;
    }
    const query = state.data.lectureName;

    state.relatedSearchList = state.lectureList.filter(item => {
      if (isChosung(query)) {
        return getChosung(item.name).includes(query);  // 초성 검색
      }
      return item.name.toLowerCase().includes(query.toLowerCase()); // 일반 검색
    });
  };


  // 2. 항목 클릭 시 데이터 선택
  const selectLecture = (lecture) => {
    state.data.lectureName = lecture.name; // 입력창에 이름 표시
    state.data.lectureId = lecture.lectureId; // 서버로 보낼 ID 저장
    state.relatedSearchList = []; // 목록 닫기
  };

  let timer;
  const typing = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      searchLecture();
    }, 200); // 0.2초마다 실행하여 즉각적인 반응을 줌
  };

</script>

<template>
  <div class="container">
    <DataTable :columns="['이수구분', '전공명', '강의명','교수명','강의실','강의시간','이수학점','대상학년']"
      :rows="state.list" gridCols="1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr" :isLoading="state.isLoading" emptyMessage="조회된 계정이 없습니다.">
      <article class="tbl-row" v-for="item in state.list" :key="item.lectureId" @click="moveToDetail(item.lectureId)">
        <div>{{item.lectureType}}</div>
        <div>{{item.majorName}}</div>
        <div>{{item.lectureName}}</div>
        <div>{{item.proName}}</div>
        <div>{{item.building}}{{ item.roomNumber }}</div>
        <div>{{item.dayOfWeek}}{{ item.startPeriod }} 교시~ {{ item.endPeriod }}교시</div>
        <div>{{item.credit}}</div>
        <div>{{item.academicYear}}</div>
      </article>
    </DataTable>
    <input type="search" v-model="state.lectureName" @input="searchLecture" @keydown="handleKeydown" placeholder="강의명 검색">
    <button @click="searchLecture">검색</button>
  </div>
</template>

<style scoped>
</style>
