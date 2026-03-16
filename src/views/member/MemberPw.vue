<script setup>
import { useAuthStore } from '@/stores/authentication';
import { useRouter } from 'vue-router';
import { reactive } from 'vue';
import { checkValidation, validateFields } from '@/utils/validation';
import memberService from '@/services/memberService';
import { useModalStore } from '@/stores/modal'

const authStore = useAuthStore()
const router = useRouter();
const modal = useModalStore()

const state = reactive({
  data: {
    oldPassword: '',
    newPassword: ''
  },
  chkPw: ''
});

const submit = async () => {
  //유효성 체크
  const requiredFields = {
    [state.data.oldPassword]: '기존 비밀번호',
    [state.data.newPassword]: '신규 비밀번호',
  };
  if (checkValidation()) { return; }
  if (!validateFields(requiredFields)) { return; }

  //비밀번호, 확인 비밀번호 체크
  if (state.chkPw !== state.data.newPassword) {
    alert('비밀번호와 확인 비밀번호가 일치하지 않습니다.');
    return;
  }

  const res = await memberService.changePw(state.data);
  console.log('res:', res);
  if (res.status === 200) {
    await modal.showAlert('비밀번호를 변경하였습니다', 'success');
    await router.push('/member/me');
  }
};
</script>

<template>
  <div class="container">
    <div class="content-wrap">
      <div class="form-grid">
        <div class="input-wrap">
          <div class="input-label">기존 비밀번호</div>
          <div class="input-content">
            <label>
              <input type="password" class="valid" v-model="state.data.oldPassword" not-null-message="기존 비밀번호를 입력해주세요." placeholder="기존 비밀번호를 작성해주세요">
            </label>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">새 비밀번호</div>
          <div class="input-content">
            <label>
              <input type="password" class="valid" v-model="state.data.newPassword" not-null-message="변경할 비밀번호를 입력해주세요." placeholder="변경할 비밀번호를 작성해주세요"
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
              <input type="password" v-model="state.chkPw" placeholder="변경 비밀번호 확인" autocomplete="off">
            </label>
          </div>
        </div>
      </div>
      <div class="btn-row g10">
        <button class="btn btn-default" @click="router.go(-1)"><font-awesome-icon icon="fa-solid fa-arrow-left" />
          돌아가기</button>
        <button @click="submit" class="btn btn-submit"><font-awesome-icon icon="fa-solid fa-circle-check" /> 비밀번호 변경</button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
