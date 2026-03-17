<script setup>
import CalendarDate from '@/components/util/CalendarDate.vue';
import DataTable from '@/components/common/DataTable.vue';
const tableData = [
  1, 2, 3, 4, 5
]
</script>

<template>

  <!--

페이지 전체 제목 말고 한 섹션(수강가능강의 테이블 위 '전체 강의'제목이라던가)의 제목을 쓰고 싶다면
<div class="container">로 감싼 뒤 <h2>제목</h2>을

흰배경을 두고 싶다면 content를
<div class="content-wrap" 안에 소제목을 쓰고 싶다면 <h3>소제목</h3>을

흰 배경 내 영역을 나누고 싶다면 <div class="content"을
-->

  <!-- <div class="content-header">
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
  </div> --> <!-- 서치와 필터 탭도 컴포넌트화 하는 방법 궁리해볼 것!-->

  <div class="container">
    <h2>중간 제목</h2>
    <div class="content-wrap">
      <h3>소제목</h3>
      <div class="content">
        내용
      </div>
    </div>
  </div>

  <!-- table 컴포넌트 꼭 임포트할것 -->
  <div class="container">
    <h2>TABLE SAMPLE</h2>
    <DataTable :columns="['학번', '학과', '이름', '상태', '이메일', '전화번호']" :rows="tableData"
      gridCols="120px 150px 100px 80px 1fr 1fr">
      <article class="tbl-row" v-for="(item, index) in tableData" :key="index">
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
      </article>
    </DataTable>
  </div>


  <!-- detail 화면 등 흰 박스의 경우 -->
  <div class="container">
    <h2>detail 화면 등 흰 박스의 경우</h2>
    <div class="content-wrap">
      <h3>흰 박스 안에 테이블을 넣는 경우</h3>
      <div class="content">
        <!-- 흰 박스 안 테이블의 경우 -->
        <DataTable :columns="['column', 'column', 'column', 'column', 'column', 'column']" :rows="tableData"
          gridCols="1fr 1fr 1fr 1fr 1fr 1fr">
          <article class="tbl-row" v-for="item in tableData" :key="item">
            <div>sample</div>
            <div>sample</div>
            <div>sample</div>
            <div>sample</div>
            <div>sample</div>
            <div>sample</div>
          </article>
        </DataTable>
      </div>
    </div>
  </div>


  <div class="container">
    <h2>FORM SAMPLE</h2>
    <div class="content-wrap">
      <h3>1개의 열에 두개의 인풋</h3>
      <div class="form-grid" style="--grid-cols: 1fr">
        <div class="input-wrap">
          <div class="input-label"><span>이름</span></div>
          <div class="input-content two-input">
            <label>
              <input type="text">
            </label>
            <label>
              <input type="text">
            </label>
          </div>
        </div>
      </div>
      <h3>2개의 열</h3>
      <div class="form-grid" style="--grid-cols: 1fr 1fr">
        <div class="input-wrap">
          <div class="input-label"><span>이름</span></div>
          <div class="input-content">
            <label>
              <input type="text">
            </label>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label"><span>생년월일</span></div>
          <div class="input-content">
            <CalendarDate />
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label"><span>전화번호</span></div>
          <div class="input-content">
            <label>
              <input type="text">
            </label>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label"><span>이메일</span></div>
          <div class="input-content radio-group">
            <label class="radio-label">
              <input type="radio" name="role" value="첫번째" /> 첫번째
            </label>
            <label class="radio-label">
              <input type="radio" name="role" value="두번째" /> 두번째
            </label>
            <label class="radio-label">
              <input type="radio" name="role" value="세번째" /> 세번째
            </label>
          </div>
        </div>
      </div>
      <h3>3개의 열</h3>
      <div class="form-grid" style="--grid-cols: 1fr 1fr 1fr">
        <div class="input-wrap">
          <div class="input-label"><span>이름</span></div>
          <div class="input-content">
            <label>
              <input type="text">
            </label>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label"><span>선택</span></div>
          <div class="input-content">
            <select name="major">
              <option value="">----학과선택----</option>
              <option value="선택1">선택1</option>
              <option value="선택2">선택2</option>
              <option value="선택3">선택3</option>
            </select>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label"><span>전화번호</span></div>
          <div class="input-content">
            <label>
              <input type="text">
            </label>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label"><span>이메일</span></div>
          <div class="input-content">
            <label>
              <input type="text">
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- button 디자인 -->
    <div class="btn-row">
      <button class="btn btn-submit">등록</button>
      <button class="btn btn-default">취소</button>
      <button class="btn btn-default">취소</button>
      <button class="btn btn-secondary">임시저장</button>
    </div>
  </div>




</template>

<style scoped>
</style>
