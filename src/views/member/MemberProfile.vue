<script setup>
import memberService from '@/services/memberService';
import { useAuthStore } from '@/stores/authentication';
import { onMounted, reactive } from 'vue';
import ProfileImg from '@/components/common/ProfileImg.vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore()
const router = useRouter();

const state = reactive({
  profileInfo: {}
})

// 로그인 유저 본인의 프로파일 가져오기
const getUserData = async () => {
  const res = await memberService.findUserProfile();
  if (res.status === 200) {
    state.profileInfo = res.data.result;
    console.log(state.profileInfo)
  }
};

// 생년월일 표기
const birthDate = yearDate =>{
  if (!yearDate) return '-'
  const data = yearDate.split('-')
  return `${data[0]}년 ${parseInt(data[1])}월 ${parseInt(data[2])}일생`
}

// 라이프사이클
onMounted(async () => {
  getUserData();
})
</script>

<template>
  <div class="d-grid g20" style="--grid-cols:300px 1fr;">
    <div class="container">
      <div class="info-wrap g10 content-wrap">
        <div class="info-img d-flex jc-center">
          <ProfileImg :memberId="authStore.loginUserId" :existPic="state.profileInfo.pic" />
        </div>
        <div class="info-title">
          <h2>{{ state.profileInfo.name }}</h2>
          <span class="info-detail">
            {{ birthDate(state.profileInfo.birth) }}
          </span>
        </div>
        <div class="btn-row direct-col g5">
          <button class="btn btn-line" @click="router.push('/member/me/mod')"><font-awesome-icon icon="fa-solid fa-pen-to-square" /> 내 정보 수정</button>
          <button class="btn btn-line" @click="router.push('/member/me/pw')"><font-awesome-icon icon="fa-solid fa-lock" /> 비밀번호 변경</button>
        </div>
      </div>
    </div>
    <div class="container g10">
      <div class="info-wrap content-wrap d-grid g10" style="--grid-cols:repeat(auto-fill, minmax(150px,1fr))">

        <dl v-if="state.profileInfo.profMajorName || state.profileInfo.stdMajorName" class="g-col-full">
          <dt>전공</dt>
          <dd>{{ state.profileInfo.profMajorName || state.profileInfo.stdMajorName }}</dd>
        </dl>

        <dl v-if="state.profileInfo.academicYear && authStore.role == 'student'">
          <dt>학년</dt>
          <dd>{{ state.profileInfo.academicYear }}</dd>
        </dl>
        <dl v-if="state.profileInfo.semester && authStore.role == 'student'">
          <dt>학기</dt>
          <dd>{{ state.profileInfo.semester }}</dd>
        </dl>

        <dl v-if="state.profileInfo.degree && authStore.role == 'professor'">
          <dt>학위</dt>
          <dd>{{ state.profileInfo.degree }}</dd>
        </dl>
        <dl v-if="state.profileInfo.position && authStore.role == 'professor'">
          <dt>직위</dt>
          <dd>{{ state.profileInfo.position }}</dd>
        </dl>

        <dl>
          <dt>상태</dt>
          <dd>{{ state.profileInfo.stdStatus || state.profileInfo.profStatus || state.profileInfo.stfStatus }}</dd>
        </dl>

        <dl>
          <dt>
            <template v-if="authStore.role == 'student'">입학시기</template>
            <template v-else>입사시기</template>
          </dt>
          <dd>{{  state.profileInfo.entryDate }}</dd>
        </dl>
        <dl v-if="state.profileInfo.exitDate">
          <dt>
            <template v-if="authStore.role == 'student'">졸업시기</template>
            <template v-else-if="authStore.role == 'professor'">퇴임시기</template>
            <template v-else>퇴사시기</template>
          </dt>
          <dd>{{  state.profileInfo.exitDate }}</dd>
        </dl>

      </div>

      <div v-if="authStore.role == 'professor' && (state.profileInfo.labRoom || state.profileInfo.labTel)" class="info-wrap content-wrap d-grid g10" style="--grid-cols:repeat(auto-fill, minmax(150px,1fr))">
        <dl v-if="state.profileInfo.labRoom">
          <dt>연구실 위치</dt>
          <dd>{{ state.profileInfo.labRoom || '-' }}</dd>
        </dl>
        <dl v-if="state.profileInfo.labTel">
          <dt>연구실 번호</dt>
          <dd>{{ state.profileInfo.labTel || '-' }}</dd>
        </dl>
      </div>

      <div class="info-wrap content-wrap d-grid g10" style="--grid-cols:repeat(auto-fill, minmax(300px,1fr))">
        <dl class="g-col-full">
          <dt>이메일</dt>
          <dd>{{ state.profileInfo.email || '-' }}</dd>
        </dl>
        <dl>
          <dt>전화번호</dt>
          <dd>{{ state.profileInfo.tel || '-' }}</dd>
        </dl>
        <dl>
          <dt>비상연락망</dt>
          <dd>{{ state.profileInfo.emergencyTel || '-' }}</dd>
        </dl>
        <dl class="g-col-full">
          <dt>주소</dt>
          <dd>
            <span v-if="state.profileInfo.postcode">({{ state.profileInfo.postcode }})</span>
            {{ state.profileInfo.address || '-' }} {{ state.profileInfo.detailAddress }}</dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-wrap { display: grid;}
.info-img {}
.info-title{padding: 5px;}
.info-title h2{font-size: var(--text-xxl);font-weight: 600;}
.info-title .info-detail{color: #999;}

.info-wrap dl{display: flex;flex-direction: column;gap: 5px;}
.info-wrap dl dt{color: var(--main-color);font-weight: bold;font-size: var(--text-sm);}
.info-wrap dl dd{}
</style>
