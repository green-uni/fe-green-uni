<script setup>
import CalendarDate from '@/components/util/CalendarDate.vue';

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

  <!-- table의 경우 (하단 style도 가져가야함) -->
  <div class="container">
    <h2>TABLE SAMPLE</h2>
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
      <article class="tbl-row">
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
      </article>
      <article class="tbl-row">
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
      </article>
      <article class="tbl-row">
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
        <div>-</div>
      </article>
    </section>
  </div>


  <!-- detail 화면 등 흰 박스의 경우 -->
  <div class="container">
    <h2>detail 화면 등 흰 박스의 경우</h2>
    <div class="content-wrap">
      <h3>흰 박스 안에 테이블을 넣는 경우</h3>
      <div class="content">
        <!-- 흰 박스 안 테이블의 경우 (하단 열 갯수 새는 것도 꼭 필요) -->
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
          <article class="tbl-row">
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
          </article>
          <article class="tbl-row">
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
          </article>
          <article class="tbl-row">
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
            <div>-</div>
          </article>
        </section>
      </div>
    </div>
  </div>


  <div class="container">
    <h2>FORM SAMPLE</h2>
    <div class="content-wrap">
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
              <option  value="선택1">선택1</option>
              <option  value="선택2">선택2</option>
              <option  value="선택3">선택3</option>
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
/* table의 column 갯수와 크기는 아래와 같이 설정 */
.tbl-wrap {
  --grid-cols: 120px 150px 100px 80px 200px 200px 1fr 1fr
}
</style>
