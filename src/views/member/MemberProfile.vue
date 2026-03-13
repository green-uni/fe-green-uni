<script setup>
import memberService from '@/services/memberService';
import { useAuthStore } from '@/stores/authentication';
import { onMounted, reactive } from 'vue';

const authStore = useAuthStore()

console.log("loginUserRole: ", authStore.role)

const state = reactive({
  profileInfo: {}
})

const getUserData = async () => {

  const res = await memberService.findUserProfile();

  if (res.status === 200) {
    state.profileInfo = res.data.result;
    console.log(state.profileInfo)
    const profileImg = `${state.profileInfo.pic}`;
  }
};

onMounted(async () => {
  getUserData();
})


</script>

<template>
  <div class="d-grid g10" style="--grid-cols:250px 1fr;">
    <div class="container">
      <div class="content-wrap">
        <div class="info-img">
          <img :src="profileImg">
        </div>
        <div class="info-title">
          <h2>{{ state.profileInfo.name }}</h2>
          <div class="info">
            {{ state.profileInfo.birth }}
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="content-wrap d-grid" style="--grid-cols:1fr 1fr 1fr">

        <dl v-if="state.profileInfo.profMajorName || state.profileInfo.stdMajorName">
          <dt>전공</dt>
          <dd>{{ state.profileInfo.profMajorName || state.profileInfo.stdMajorName }}</dd>
        </dl>

        <dl v-if="authStore.role=='student'">
          <dt>학년</dt>
          <dd>{{ state.profileInfo.academicYear }}</dd>
        </dl>
        <dl v-if="authStore.role=='student'">
          <dt>학기</dt>
          <dd>{{ state.profileInfo.semester }}</dd>
        </dl>

        <dl v-if="authStore.role=='professor'">
          <dt>학위</dt>
          <dd>{{ state.profileInfo.degree }}</dd>
        </dl>
        <dl v-if="authStore.role=='professor'">
          <dt>직위</dt>
          <dd>{{ state.profileInfo.position }}</dd>
        </dl>

        <dl>
          <dt>상태</dt>
          <dd>{{ state.profileInfo.stfStatus || state.profileInfo.profStatus || state.profileInfo.stfStatus }}</dd>
        </dl>

        <dl>
          <dt>
            <template v-if="authStore.role=='student'">입학연도</template>
            <template v-else>입사연도</template>
          </dt>
          <dd>{{ state.profileInfo.entryDate }}</dd>
        </dl>
        <dl>
          <dt>
            <template v-if="authStore.role=='student'">졸업연도</template>
            <template v-else-if="authStore.role=='professor'">퇴임연도</template>
            <template v-else>퇴사연사</template>
          </dt>
          <dd>{{ state.profileInfo.exitDate }}</dd>
        </dl>

      </div>

      <div class="content-wrap d-grid" style="--grid-cols:1fr 1fr">
        <dl>
          <dt>연구실 위치</dt>
          <dd>{{ state.profileInfo.labRoom || '-' }}</dd>
        </dl>
        <dl>
          <dt>연구실 번호</dt>
          <dd>{{ state.profileInfo.labTel || '-' }}</dd>
        </dl>
      </div>

      <div class="content-wrap d-grid" style="--grid-cols:1fr 1fr 1fr">
        <dl>
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
        <dl>
          <dt>비상연락망</dt>
          <dd>{{ state.profileInfo.emergencyTel || '-' }}</dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<style scoped>
.d-grid{display:grid; grid-template-columns: var(--grid-cols);}
</style>
