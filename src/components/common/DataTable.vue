<script setup>
defineProps({
  columns: Array,
  rows: Array,
  gridCols: String,
  isLoading: Boolean, // 데이터 가져오는 중일 때 ( MemberList 참고 )
  className:String,
  emptyMessage: {  // 데이터 없을 때 메시지
    type: String,
    default: ' 조회된 데이터가 없습니다. '
  }
})
</script>

<template>
  <section class="tbl-wrap" :class="className" :style="`--grid-cols: ${gridCols}`">
    <article class="tbl-head">
      <div v-for="col in columns" :key="col">{{ col }}</div>
    </article>
    <template v-if="!isLoading && rows.length > 0"><!-- 로딩중도 아니고 배열이 0도 아닐때 -->
      <slot /><!-- // 데이터가 들어가는 부분 -->
    </template>
    <article v-if="isLoading" class="no-data"> <!-- 데이터를 가져오는 중일 때 -->
      <p>불러오는 중...</p>
    </article>
    <article v-else-if="rows.length === 0" class="no-data"> <!-- 조회된 데이터가 없을 때 -->
      <p>{{ emptyMessage }}</p>
    </article>
  </section>
</template>

<style scoped></style>
