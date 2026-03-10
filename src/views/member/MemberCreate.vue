<script setup>
import majorService from '@/services/majorService';
import { onMounted, reactive } from 'vue';

const state = reactive({
  majorList:[],
  data: {
    role: 'student',
    birth: '',
    name: '',
    email: '',
    tel: '',
    emergencyTel: '',
    address: '',
    detailAddress: '',
    entryDate: '',
    status: '',
    majorId: '',
    degree: '',
    academicYear: '',
    semester: '',
    position: '',
    labRoom: '',
    labTel: '',
  },
  pic: null,
});

onMounted(async () =>{
  const res = await majorService.findAll();
  state.majorList = res.result;
  console.log(state.majorList[0]);
})

</script>

<template>
  <div>
    <h3>기본 정보</h3>
    <div>
      <label>
        <input type="radio" id="student" name="role" value="student" v-model="state.data.role">
        <span>학생</span>
      </label>
      <label>
        <input type="radio" id="professor" name="role" value="professor" v-model="state.data.role">
        <span>교수</span>
      </label>
      <label>
        <input type="radio" id="admin" name="role" value="admin" v-model="state.data.role">
        <span>관리자</span>
      </label>
      ({{ state.data.role }})
    </div>
    <div>
      <label>
        <span>이름</span>
        <input type="text" v-model="state.data.name">
      </label>
      ({{ state.data.name }})
    </div>
    <div>
      <label>
        <span>생년월일</span>
        <input type="date" v-model="state.data.birth">
      </label>
      ({{ state.data.birth }})
    </div>
    <!-- <div>
      <label>
        <span>전화번호</span>
        <input type="text" v-model="state.data.tel">
      </label>
      ({{ state.data.tel }})
    </div>
    <div>
      <label>
        <span>이메일</span>
        <input type="text" v-model="state.data.email">
      </label>
      ({{ state.data.email }})
    </div> -->
    <div>
      <label>
        <span v-if="state.data.role == 'student'">입학연도</span>
        <span v-else-if="state.data.role == 'admin' || 'professor'">입사연도</span>
        <input type="date" v-model="state.data.entryDate">
      </label>
      ({{ state.data.entryDate }})
    </div>
    <div>
      <label>
        <span>상태</span>
        <div v-if="state.data.role == 'student'">
          <select name="status" v-model="state.data.status">
            <option value="재학">재학</option>
            <option value="휴학">휴학</option>
            <option value="졸업">졸업</option>
            <option value="졸업">졸업</option>
            <option value="자퇴">자퇴</option>
          </select>
        </div>
        <div v-else-if="state.data.role == 'professor'">
          <select name="status" v-model="state.data.status">
            <option value="재직">재직</option>
            <option value="휴직">휴직</option>
            <option value="퇴임">퇴임</option>
          </select>
        </div>
        <div v-else-if="state.data.role == 'admin'">
          <select name="status" v-model="state.data.status">
            <option value="재직">재직</option>
            <option value="휴직">휴직</option>
            <option value="퇴사">퇴사</option>
          </select>
        </div>
      </label>
      ({{ state.data.status }})
    </div>
    <h3>학적정보</h3>
    <div v-if="state.data.role == 'student' || 'professor'">
        <div>
          <select name="status" v-model="state.data.majorId">
            <option value="">----학과선택----</option>
            <option v-for="major in state.majorList" :key="major.majorId" :value="major.name">{{ major.name }}</option>
          </select>
        </div>
      ({{ state.data.majorId }})
    </div>

    <div>
      <button @click="sendData">계정 생성</button>
    </div>
  </div>

</template>

<style scoped></style>
