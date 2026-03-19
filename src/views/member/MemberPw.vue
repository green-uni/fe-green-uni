<script setup>
import { useAuthStore } from '@/stores/authentication';
import { useRouter } from 'vue-router';
import { reactive, computed } from 'vue';
import { checkValidation } from '@/utils/validation';
import { useModalStore } from '@/stores/modal'
import memberService from '@/services/memberService';
import PwCheckList from '@/components/util/PwCheckList.vue';

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
const pwView = () => { state.modeShowPw = !state.modeShowPw }

const submit = async () => {
  //유효성 체크
  if (checkValidation()) { return; }

  //비밀번호, 확인 비밀번호 체크
  if (state.chkPw !== state.data.newPassword) {
    modal.showAlert('비밀번호와 확인 비밀번호가 일치하지 않습니다.', 'error')
    return;
  }
  try {
    const res = await memberService.changePw(state.data);
    await modal.showAlert(res.result, 'success')
    await router.push('/member/me');
  } catch (e) { console.error(e) }
}
</script>

<template>
  <div class="container">
    <div class="content-wrap">
      <div class="form-grid">
        <div class="input-wrap">
          <div class="input-label">기존 비밀번호</div>
          <div class="input-content">
            <label>
              <input type="password" class="valid" v-model="state.data.oldPassword" not-null-message="기존 비밀번호를 입력해주세요."
                placeholder="기존 비밀번호를 작성해주세요">
            </label>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">새 비밀번호</div>
          <div class="input-content">
            <label>
              <input :type="state.modeShowPw ? 'text' : 'password'" class="valid" v-model="state.data.newPassword" not-null-message="변경할 비밀번호를 입력해주세요."
                placeholder="변경할 비밀번호를 작성해주세요"
                regexp="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?])[A-Za-z\d!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?]{10,}$"
                regexp-message="비밀번호는 영문자, 숫자, 특수기호로 구성되며 10자 이상이어야 합니다." autocomplete="off" />
                <span @click="pwView" class="showPw" :class="!state.modeShowPw || 'show'"><font-awesome-icon
                icon="fa-solid fa-eye" /></span>
            </label>
            <PwCheckList :password="state.data.newPassword" />
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">새 비밀번호 확인</div>
          <div class="input-content">
            <label>
              <input :type="state.modeShowPw ? 'text' : 'password'" v-model="state.chkPw" placeholder="변경 비밀번호 확인" autocomplete="off">
            </label>
          </div>
        </div>

      </div>
      <div class="btn-row g10">
        <button class="btn btn-default" @click="router.go(-1)"><font-awesome-icon icon="fa-solid fa-arrow-left" />
          돌아가기</button>
        <button @click="submit" class="btn btn-submit"><font-awesome-icon icon="fa-solid fa-circle-check" /> 비밀번호
          변경</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

.container{align-items: center;}
.content-wrap{width: 700px;}

.form-grid{row-gap: 10px;}
.input-wrap{ grid-template-columns: 110px 1fr;}
.input-wrap .input-label {padding-top: 5px;    align-self: flex-start;}

.showPw{position: absolute;right: 10px;top: 50%;transform: translateY(-50%);color: #ddd;cursor: pointer;}
.showPw.show{color: var(--font-color);}
</style>
