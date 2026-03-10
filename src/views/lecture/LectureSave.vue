<script setup>
import majorService from '@/services/majorService';;
import { onMounted, reactive } from 'vue';


const state = reactive({
  majorList:[],
  selectedIndex: -1,
  data: {
    memberId:'',
    memberName:'',
    majorId:'',
    majorName:'',
    year:'2026',
    semester:'', 
    name:'',
    credit:'',
    type:'',
    
    refBooks:'',
    goal:'',
    weeklyPlan:'',
    academicYear:'',
    maxStd:'',
    startDate:'',
    endDate:''},

    relatedSearchList:[]
  });


onMounted(async () => {
  try {
    const res = await majorService.findAll(); // 전체 리스트 조회 함수
    state.majorList = res.result || [];
    console.log("로드된 학과 목록:", state.majorList);
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  }
});

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
      selectMajor(state.relatedSearchList[state.selectedIndex]);
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

const searchMajor = () => {
  if (!state.data.majorName) {
    state.relatedSearchList = [];
    return;
  }
  const query = state.data.majorName;

  state.relatedSearchList = state.majorList.filter(item => {
    if (isChosung(query)) {
      return getChosung(item.name).includes(query);  // 초성 검색
    }
    return item.name.toLowerCase().includes(query.toLowerCase()); // 일반 검색
  });
};


// 2. 항목 클릭 시 데이터 선택
const selectMajor = (major) => {
  state.data.majorName = major.name; // 입력창에 이름 표시
  state.data.majorId = major.majorId; // 서버로 보낼 ID 저장
  state.relatedSearchList = []; // 목록 닫기
};

let timer;
const typing = () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    searchMajor();
  }, 200); // 0.2초마다 실행하여 즉각적인 반응을 줌
};
</script>

<template>
<h3>교수정보</h3>
<div>
    <div>
        <label>
            교번<input type="text" v-model="state.data.memberId" disabled>
        </label>
        <label>    
            교수명<input type="text" v-model="state.data.memberName" disabled>
        </label>
    </div>
</div>


<h3>개설강의정보</h3>
<div>
    <div>
        <label>
            <span>강의연도</span>
            <input type="text" v-model="state.data.year" disabled>
        </label>
    </div>

    <div>
        <span>학기</span>
        <label>
            <input type="radio" id="1" name="semester" value="1" v-model="state.data.semester">
            <span>1학기</span>
        </label>
        <label>
            <input type="radio" id="2" name="semester" value="2" v-model="state.data.semester">
            <span>2학기</span>
        </label>
    </div>

    <div>
        <label>
            <span>강의명</span>
            <input type="text" v-model="state.data.name">
        </label>
    </div>

    <div>
        <span>대상학년</span>
        <label>
            <input type="radio" id="1" name="academicYear" value="1" v-model="state.data.academicYear">
        <span>1학년</span>
        </label>
          <label>
            <input type="radio" id="2" name="academicYear" value="2" v-model="state.data.academicYear">
        <span>2학년</span>
        </label>
        <label>
            <input type="radio" id="3" name="academicYear" value="3" v-model="state.data.academicYear">
            <span>3학년</span>
        </label>
        <label>
            <input type="radio" id="4" name="academicYear" value="4" v-model="state.data.academicYear">
            <span>4학년</span>
        </label>
    </div>

    <div>
        <span>수강인원</span>
        <input type="text" v-model="state.data.maxStd">
    </div>

    <div>
        <span>교과구분</span>
        <input type="radio" id="major" name="type" value="전공" v-model="state.data.type">
        <span>전공</span>
        <input type="radio" id="general" name="type" value="교양" v-model="state.data.type">
        <span>교양</span>
    </div>

    <div>
        <span>전공명</span>
        <span>
            <input type="search" placeholder="학과명을 입력하세요" @keydown="handleKeydown" v-model="state.data.majorName" @input="searchMajor">
            <button @click="searchMajor">검색</button>
            
            <div class="relate" v-if="state.relatedSearchList.length > 0">
            <div v-for="item in state.relatedSearchList" 
                :key="item.majorId" 
                class="idx" 
                @click="selectMajor(item)">
                {{ item.name }}
            </div>
            </div>
        </span>
    </div>

    <div>
        <span>이수학점</span>
        <span>
            <input type="radio" id=1 name="credit" value=1 v-model="state.data.credit">
            <span>1학점</span>
            <input type="radio" id=2 name="credit" value=2 v-model="state.data.credit">
            <span>2학점</span>
            <input type="radio" id=3 name="credit" value=3 v-model="state.data.credit">
            <span>3학점</span>
        </span>
    </div>
</div>

</template>

<style scoped>

</style>