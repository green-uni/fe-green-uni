<script setup>
import memberService from '@/services/memberService';
import { ref, onMounted, reactive } from 'vue';
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

</script>

<template>
  <div class="contianer">
    <section class="table">
      <article class="head">
        <div>교번</div>
        <div>학과</div>
        <div>이름</div>
        <div>상태</div>
        <div>입사연도</div>
        <div>퇴직연도</div>
        <div>이메일</div>
        <div>전화번호</div>
      </article>
      <article class="row" v-for="item in state.list" :key="item.code">
        <div>{{ item.code }}</div>
        <div>{{ item.stdMajorName }}{{ item.profMajorName }}</div>
        <div>{{ item.name }}</div>
        <div>{{ item.stdStatus }}{{ item.profStatus }}{{ item.stfStatus }}</div>
        <div>{{ item.entryDate }}</div>
        <div>{{ item.exitDate }}</div>
        <div>{{ item.email ? item.email : '-' }}</div>
        <div>{{ item.tel ? item.tel : '-' }}</div>
      </article>
    </section>
  </div>
</template>

<style scoped>
/* table의 column 갯수와 크기는 아래와 같이 설정 */
.table{
  --grid-cols: 120px 150px 100px 80px 200px 200px 1fr 1fr
  }
</style>
