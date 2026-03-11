<script setup>
import majorService from '@/services/majorService';
import { createMember } from '@/services/memberService';
import { onMounted, reactive, ref } from 'vue';

const fileInput = ref(null);
const imageUrl = ref(null);

const state = reactive({
  majorList: [],
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

    academicYear: null,
    semester: null,

    degree: '',
    position: '',
    labRoom: '',
    labTel: '',
  },
  pic: null,
});

onMounted(async () => {
  const res = await majorService.listForCreate();
  state.majorList = res.result;
  console.log(state.majorList[0]);
})


const openFileSelector = e => {
  fileInput.value.click();
};

const handlePicChanged = e => {
  imageUrl.value = null;
  state.pic = e.target.files[0];
  if (state.pic) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target.result; // Data URL로 변환하여 저장
    };
    reader.readAsDataURL(state.pic);
  }
};


const submit = async () => {

    const formData = new FormData();
    formData.append('req', new Blob([JSON.stringify(state.data)], { type: 'application/json' }));
    if (state.pic) {
        formData.append('pic', state.pic);
    }

  const res = await createMember(formData);
  console.log('res: ', res);

}

</script>

<template>
  <div>
    <div>

    </div>
    <h3>기본 정보</h3>
    <form @submit.prevent="submit">
      <div>
        <span variant="outline-primary" @click="openFileSelector">프로필 사진</span>
        <span>프로필 사진</span>
        <input ref="fileInput" type="file" accept="image/*" @change="handlePicChanged">
        <div v-if="imageUrl">
          <img :src="imageUrl" alt="Selected" style="max-width: 300px; margin-top: 10px;" />
        </div>
      </div>
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
        ({{ state.data.role }}) 학기
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
            <option v-for="major in state.majorList" :key="major.majorId" :value="major.majorId">{{ major.name }}
            </option>
          </select>
        </div>
        ({{ state.data.majorId }})
      </div>

      <div>
        <button>계정 생성</button>
      </div>
    </form>

  </div>

</template>

<style scoped></style>
