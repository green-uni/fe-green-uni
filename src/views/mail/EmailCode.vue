<script setup>
import { useRouter } from 'vue-router';
const router = useRouter()

const submit = async() => {
  router.push('/pw/reset')
}

</script>

<template>
  <div class="container">
    <h2>코드입력하기</h2>
    <p>비밀번호를 찾고자하는 학번과 인증코드를 받을 이메일을 입력해주세요.</p>
    <div class="content-wrap">
      <div class="form-grid">
        <div class="input-wrap">
          <div class="input-label">학번</div>
          <div class="input-content">
            <label>
              <input type="text" class="valid"><input type="text" class="valid"><input type="text" class="valid"><input type="text" class="valid"><input type="text" class="valid">
            </label>
          </div>
        </div>
      </div>
      <div class="btn-row g10">
        <button @click="submit" class="btn btn-submit">코드 확인</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
