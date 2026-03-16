<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  maxPage: { type: Number, required: true },
  pageGroupSize: { type: Number, default: 10 }
})

/////// 부모에 페이징 관련 변수 있는지 확인
// const state = reactive({
//   size: 2,
//   currentPage: 1,
//   maxPage: 0,
//   pageGroupSize: 3
// })

//////// 해당 컴포넌트 사용하는 페이지에 페이징 함수 꼭 사용 (MemberList 참고)
const emit = defineEmits(['goToPage'])


//현재 페이지가 몇번째 그룹인지 계산 //currentPage=13 이면 → Math.ceil(13/10) = 2 → 2그룹
const currentGroup = computed(() => Math.ceil(props.currentPage / props.pageGroupSize))

// 현재 그룹의 첫번째 페이지 번호
// 2그룹이면 → (2-1)*10+1 = 11
const startPage = computed(() => (currentGroup.value - 1) * props.pageGroupSize + 1)

// 현재 그룹의 마지막 페이지 번호
// 3그룹이면 → 3*10=30, 근데 maxPage가 25면 25 (Math.min으로 초과 방지)
const endPage = computed(() => Math.min(currentGroup.value * props.pageGroupSize, props.maxPage))

// startPage~endPage 숫자 배열 생성
const displayedPages = computed(() => {
  const pages = []
  for (let i = startPage.value; i <= endPage.value; i++) pages.push(i)
  return pages
})

// 부모에 페이지 이동 함수 꼭 작성
const goToPage = (page) => emit('goToPage', page)

// << 버튼: 이전 그룹 첫 페이지로
const goToFirstPage = () => goToPage(1)

// 2그룹(11~20)에서 클릭 → startPage(11) - 1 = 10 → 1그룹으로
const goToPrevPage = () => { if (startPage.value - 1 >= 1) goToPage(startPage.value - 1) }

// 1그룹(1~10)에서 클릭 → endPage(10) + 1 = 11 → 2그룹으로
const goToNextPage = () => { if (endPage.value + 1 <= props.maxPage) goToPage(endPage.value + 1) }

// >> 버튼: 다음 그룹 첫 페이지로
const goToLastPage = () => goToPage(props.maxPage)
</script>

<template>
  <div class="pagination">
    <div class="page-wr">
      <button @click="goToFirstPage" v-if="startPage != 1" class="page-arrow"><font-awesome-icon
          icon="fa-solid fa-angles-left" /></button>
      <button @click="goToPrevPage" v-if="startPage != 1" class="page-arrow"><font-awesome-icon
          icon="fa-solid fa-angle-left" /></button>
      <button class="page" v-for="item in displayedPages" :key="item" :class="{ selected: item == props.currentPage }"
        @click="goToPage(item)">
        {{ item }}
      </button>
      <button @click="goToNextPage" v-if="endPage != props.maxPage" class="page-arrow"><font-awesome-icon
          icon="fa-solid fa-angle-right" /></button>
      <button @click="goToLastPage" v-if="endPage != props.maxPage" class="page-arrow"><font-awesome-icon
          icon="fa-solid fa-angles-right" /></button>
    </div>
  </div>
</template>

<style scoped>
.pagination { display: flex; justify-content: center;}

.pagination .page-wr {display: flex;  gap: 5px;}

.pagination button {  cursor: pointer;  color: #999;  background: #fff;  border: none;  font-size: .9rem;  border-radius: 5px;  padding: 5px 10px;  max-width: 28px;  display: flex;  justify-content: center;  align-items: center;}

.pagination button:not(.page-arrow):hover {  background: var(--hover-bg-color);  }
.pagination button.page-arrow {  background: #eee;}
.pagination button.selected {  background: var(--main-color);  color: #fff;}
</style>
