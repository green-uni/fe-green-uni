<script setup>
import { ref, reactive } from 'vue';
import mailService from '@/services/mailService';
import memberService from '@/services/memberService';
import { useModalStore } from '@/stores/modal';
import { useRouter } from 'vue-router';
import { checkValidation } from '@/utils/validation';

const modal = useModalStore();
const router = useRouter();

const state = reactive({
  code: '',
  email: '',
  verifyCode: '', // 인증코드
  memberId: null,  // 인증 완료 후 저장
  password: '',
  chkPw: '',
  modeShowPw: false,
})

// 비밀번호 보이기
const pwView = () => { state.modeShowPw = !state.modeShowPw }

// 초기화
const init = () =>{
  Object.assign(state, {
  code: '', email: '', verifyCode: '', memberId:null, password: '',chkPw: ''
  })
}

// 이메일 인증 단계
const step = ref(1)

// step 1: 이메일 발송
const sendEmail = async () => {
  if (checkValidation()) { return }
  try {
    await mailService.sendCode({ code: state.code, email: state.email })
    step.value = 2 // step2로 이동
  } catch (e) { console.error(e) }
}

// step 2: 인증코드 확인
const checkCode = async () => {
  if (checkValidation()) { return }
  try {
    const res = await mailService.checkCode({ email: state.email, verifyCode: state.verifyCode })
    state.memberId = res.data.result  // memberId 저장
    step.value = 3 // step3으로 이동
  } catch (e) { console.error(e) }
}

// step 3: 비밀번호 변경
const resetPw = async () => {
  if (state.password !== state.chkPw) {
    modal.showAlert('비밀번호가 일치하지 않습니다.', 'error')
    return
  }
  try {
    const res = await memberService.resetPw({ memberId: state.memberId, password: state.password })
    await modal.showAlert(res.data.result, 'success')
    init();
    router.push('/') // 로그인 페이지로 이동
  } catch (e) { console.error(e) }
}

</script>

<template>

  <div v-if="step === 1">
    <!-- 이메일 입력 -->
     <h2>비밀번호 찾기</h2>
    <p>비밀번호를 찾고자하는 학번과 인증코드를 받을 이메일을 입력해주세요.</p>
    <div class="content-wrap">
      <div class="form-grid">
        <div class="input-wrap">
          <div class="input-label">학번/교번/사번</div>
          <div class="input-content">
            <label>
              <input type="text" v-model="state.code">
            </label>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">이메일</div>
          <div class="input-content">
            <label>
              <input type="text"  v-model="state.email" />
            </label>
          </div>
        </div>
      </div>
      <div class="btn-row g10">
        <button class="btn btn-default" @click="router.go(-1)"><font-awesome-icon icon="fa-solid fa-arrow-left" />
          돌아가기</button>
        <button @click="sendEmail" class="btn btn-submit">인증번호 발송</button>
      </div>
    </div>
  </div>
  <div v-if="step === 2">
    <!-- 인증코드 입력 -->
      <h2>코드입력하기</h2>
    <p>이메일로 전송받은 코드 번호 5개를 입력해주세요</p>
    <div class="content-wrap">
      <div class="form-grid">
        <div class="input-wrap">
          <div class="input-label">인증코드</div>
          <div class="input-content">
            <label>
              <input type="text" v-model="state.verifyCode">
            </label>
          </div>
        </div>
      </div>
      <div class="btn-row g10">
        <button @click="checkCode" class="btn btn-submit">코드 확인</button>
      </div>
    </div>
  </div>
  <div v-if="step === 3">
    <!-- 새 비밀번호 입력 -->
     <div>
     <div class="content-wrap">
      <h2>인증 확인</h2>
      <p>변경할 비밀번호를 작성해주세요</p>
     <div class="input-wrap">
          <div class="input-label">새 비밀번호</div>
          <div class="input-content">
            <label>
              <input :type="state.modeShowPw ? 'text' : 'password'" class="valid"  v-model="state.password"
                not-null-message="변경할 비밀번호를 입력해주세요." placeholder="변경할 비밀번호를 작성해주세요"
                regexp="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?])[A-Za-z\d!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?]{10,}$"
                regexp-message="비밀번호는 영문자, 숫자, 특수기호로 구성되며 10자 이상이어야 합니다." autocomplete="off" />
              <span @click="pwView" :class="!state.modeShowPw || 'show'"><font-awesome-icon icon="fa-solid fa-eye" /></span>
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
        <button @click="resetPw" class="btn btn-submit"><font-awesome-icon icon="fa-solid fa-circle-check" /> 비밀번호 변경</button>
      </div>
    </div>
  </div>

</template>

<style scoped></style>
