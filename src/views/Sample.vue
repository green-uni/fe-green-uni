<script setup>


</script>

<template>
  <!-- table의 경우 (하단 style도 가져가야함) -->
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

  <!-- detail 화면 등 흰 박스의 경우 -->
  <div class="container">
    <h2>중간 제목</h2>
    <div class="content">
      <h3>소제목</h3>
      <div class="section">
        <!-- 흰 박스 안 테이블의 경우 (하단 style도 가져가야함) -->
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
    <h2>중간 제목</h2>
    <div class="content">
      <h3>소제목</h3>
      <div class="section">
        내용
      </div>
    </div>

    <!-- button 디자인 -->
    <div class="btn-row">
      <button class="btn btn-primary">등록</button>
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
