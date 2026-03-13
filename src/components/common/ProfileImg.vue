<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  memberId: [Number, String],
  clsValue: String,
  size: Number,
  pic: String,
  existPic: String,    // ✅ 기존 이미지 파일명
  editable: { type: Boolean, default: false }  // ✅ 수정 가능 여부
})

const emit = defineEmits(['update:pic'])

const fileInput = ref(null)
const previewUrl = ref(null)

// 기존 사진 or 미리보기 or 빈값

const imgSrc = computed(() => {
  if (previewUrl.value) return previewUrl.value                              // 새로 선택한 이미지
  if (props.existPic) return `/pic/member/${props.memberId}/${props.existPic}` // 기존 이미지
  return ''                                                                  // 없음
})


const openFileSelector = () => {
  if (props.editable) fileInput.value.click()
}

const handlePicChanged = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => { previewUrl.value = e.target.result }
  reader.readAsDataURL(file)
  emit('update:pic', file)  // ✅ 부모에게 file 전달
}
</script>

<template>
  <div class="pf-profile-pic d-flex dire-col g10">
    <div class="pic-box" :class="{ point: editable }" @click="openFileSelector">
      <img v-if="imgSrc" :src="imgSrc" />
      <font-awesome-icon v-else icon="fa-solid fa-camera" />
    </div>
    <div v-if="editable" @click="openFileSelector" class="btn btn-default point">
      <font-awesome-icon icon="fa-solid fa-circle-plus" />
      <span>사진 등록</span>
      <input ref="fileInput" type="file" accept="image/*" @change="handlePicChanged" style="display:none">
    </div>
  </div>
</template>

<style scoped>
.pf-profile-pic input[type="file"]{display: none;}
.pf-profile-pic .btn{text-align: center;display: flex;align-items: center;justify-content: center;gap: 10px;}
.pic-box{max-width: 230px;width: 100%;max-height: 280px;border: 1px solid #ddd;background-color: var(--hover-color);display: flex;justify-content: center;align-items: center;border-radius: 4px;overflow: hidden;}
.pic-box img{width: 100%; height: 100%; object-fit: cover;}
.pic-box svg{font-size: 5rem;color: var(--main-color);}
</style>
