<script setup>
import { reactive } from 'vue'

/*
<SearchInput
  v-model="modelValue"
  :list="검색할 전체 목록"
  placeholder=""
  @select="(data) => save" 선택한 값에 대한 함수
/>
*/

const props = defineProps({
  modelValue: { type: String, default: '' },      // v-model
  list: { type: Array, default: () => [] },        // 검색할 전체 목록
  labelKey: { type: String, default: 'name' },     // 객체의 밸유
  valueKey: { type: String, default: 'majorId' },  // 객체의 키
  placeholder: { type: String, default: '검색' }
})

const emit = defineEmits(['update:modelValue', 'select'])

const state = reactive({
  relatedSearchList: [],
  selectedIndex: -1
})

const getChosung = (str) => {
  const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
  return [...str].map(ch => {
    const code = ch.charCodeAt(0) - 0xAC00
    if (code < 0 || code > 11171) return ch
    return CHO[Math.floor(code / 28 / 21)]
  }).join('')
}
const isChosung = (str) => /^[ㄱ-ㅎ]+$/.test(str)

const onInput = (e) => {
  const query = e.target.value
  emit('update:modelValue', query)
  if (!query) { state.relatedSearchList = []; return }
  state.relatedSearchList = props.list.filter(item => {
    if (isChosung(query)) return getChosung(item[props.labelKey]).includes(query)
    return item[props.labelKey].toLowerCase().includes(query.toLowerCase())
  })
  state.selectedIndex = -1
}

const selectItem = (item) => {
  emit('update:modelValue', item[props.labelKey])
  emit('select', item)  // 선택된 item 전체를 부모에게 전달
  state.relatedSearchList = []
}

const handleKeydown = (e) => {
  if (state.relatedSearchList.length === 0) return
  if (e.key === 'ArrowDown') {
    state.selectedIndex = (state.selectedIndex + 1) % state.relatedSearchList.length
  } else if (e.key === 'ArrowUp') {
    state.selectedIndex = (state.selectedIndex - 1 + state.relatedSearchList.length) % state.relatedSearchList.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (state.selectedIndex >= 0) selectItem(state.relatedSearchList[state.selectedIndex])
  }
}
</script>

<template>
  <div class="search-input-wrap">
    <input type="search" :placeholder="placeholder" :value="modelValue" @input="onInput" @keydown="handleKeydown" />
    <div class="relate" v-if="state.relatedSearchList.length > 0">
      <div v-for="(item, idx) in state.relatedSearchList" :key="item[valueKey]"
        :class="['idx', { active: idx === state.selectedIndex }]" @click="selectItem(item)">
        {{ item[labelKey] }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 검색 결과 리스트 */
.search-input-wrap { position: relative;}

.relate { position: absolute; top: 100%; left: 0; width: 100%; background: #fff; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); z-index: 100; max-height: 200px; overflow-y: auto;}
.idx { padding: 10px 15px; cursor: pointer;}
.idx:hover,
.idx.active { background: var(--hover-bg-color); color: var(--main-color);}
</style>
