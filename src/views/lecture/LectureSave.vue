<script setup>
//import majorService from '@/services/majorService';
import majorService from '@/services/majorService';
import { onMounted, reactive } from 'vue';

const state = reactive({
    majorList:[],
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


// 1. 검색 로직 하나로 통합
const searchMajor = async () => {
    if (state.data.majorName.length < 1) {
        state.relatedSearchList = [];
        return;
    }

    try {
        const params = { search_text: state.data.majorName };
        const result = await majorService.ListUpMajor(params);
        
        // 데이터가 배열인지 확인 후 학과 이름만 추출
        state.relatedSearchList = result.resultData.map(item => item.name);
    } catch (error) {
        console.error("검색 중 오류 발생:", error);
    }
};

// 2. typing은 단순히 searchMajor를 실행만 하도록
const typing = () => {
    searchMajor();
};

// 3. 클릭 시 이름만 전달받아서 세팅
const doSearchClick = (name) => {
    state.data.majorName = name;
    state.relatedSearchList = []; // 목록 닫기
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
            <input type="search" @keyup="typing" @keyup.enter="doSearch" v-model="state.data.majorName">
            <button @click="doSearch">검색</button>
            <div class="relate">
            <div class="idx" v-for="item,idx in state.relatedSearchList" @click="doSearchClick(idx)">
            {{ item }}</div>
            </div>
        </span>
    </div>
</div>

</template>

<style scoped>

</style>