<script setup>
import { useRouter } from 'vue-router';
const router = useRouter()

const submit = async() => {
  router.push('/pw/code')
}

</script>

<template>
  <div class="container">
    <h2>비밀번호 찾기</h2>
    <p>비밀번호를 찾고자하는 학번과 인증코드를 받을 이메일을 입력해주세요.</p>
    <div class="content-wrap">
      <div class="form-grid">
        <div class="input-wrap">
          <div class="input-label">학번</div>
          <div class="input-content">
            <label>
              <input type="text" class="valid">
            </label>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">이메일</div>
          <div class="input-content">
            <label>
              <input type="text" class="valid"  />
            </label>
          </div>
        </div>
      </div>
      <div class="btn-row g10">
        <button class="btn btn-default" @click="router.go(-1)"><font-awesome-icon icon="fa-solid fa-arrow-left" />
          돌아가기</button>
        <button @click="submit" class="btn btn-submit">인증번호 발송</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
