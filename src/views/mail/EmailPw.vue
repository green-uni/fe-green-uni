<script setup>
import { useRouter } from 'vue-router';
const router = useRouter()

const submit = async() => {
  router.push('/')
}

</script>

<template>
  <div class="container">
    <div class="content-wrap">
      <div class="form-grid">
        <div class="input-wrap">
          <div class="input-label">새 비밀번호</div>
          <div class="input-content">
            <label>
              <input type="password" class="valid" not-null-message="변경할 비밀번호를 입력해주세요." placeholder="변경할 비밀번호를 작성해주세요"
                regexp="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?])[A-Za-z\d!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?]{10,}$"
                regexp-message="비밀번호는 영문자, 숫자, 특수기호로 구성되며 10자 이상이어야 합니다." autocomplete="off" />
            </label>
            <span>비밀번호는 영문자, 숫자, 특수기호로 구성되며 10자 이상이어야 합니다.</span>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">새 비밀번호 확인</div>
          <div class="input-content">
            <label>
              <input type="password" placeholder="변경 비밀번호 확인" autocomplete="off">
            </label>
          </div>
        </div>
      </div>
      <div class="btn-row g10">
        <button @click="submit" class="btn btn-submit"><font-awesome-icon icon="fa-solid fa-circle-check" /> 비밀번호 변경</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
