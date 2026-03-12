<script setup>
import CalendarDate from '@/components/util/CalendarDate.vue';
import majorService from '@/services/majorService';
import memberService from '@/services/memberService';
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
  const res = await memberService.createMember(formData);
  console.log('res: ', res);
}

</script>

<template>
  <form @submit.prevent="submit" class="form-wrap">
    <div class="content-wrap ">
      <div class="d-flex">
        <div class="pf-profile">
          <div class="radio-group">
            <label>
              <input type="radio" id="student" name="role" value="student" class="radio-label"
                v-model="state.data.role">
              <span>학생</span>
            </label>
            <label>
              <input type="radio" id="professor" name="role" value="professor" class="radio-label"
                v-model="state.data.role">
              <span>교수</span>
            </label>
            <label>
              <input type="radio" id="admin" name="role" value="admin" class="radio-label" v-model="state.data.role">
              <span>관리자</span>
            </label>
          </div>
          <div class="pf-profile-pic">
            <span variant="outline-primary" @click="openFileSelector">프로필 사진</span>
            <span>프로필 사진</span>
            <input ref="fileInput" type="file" accept="image/*" @change="handlePicChanged">
            <div v-if="imageUrl">
              <img :src="imageUrl" alt="Selected" style="max-width: 300px; margin-top: 10px;" />
            </div>
          </div>
        </div> <!-- pf-profile-->

        <div class="pf-content d-flex dire-col d-flex-grow1 g20">
          <h3>개인 정보</h3>
          <div class="form-grid" style="--grid-cols: 1fr 1fr">
            <div class="input-wrap">
              <div class="input-label"><span>이름</span></div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.name" placeholder="이름">
                </label>
              </div>
            </div>
            <div class="input-wrap">
              <div class="input-label"><span>생년월일</span></div>
              <div class="input-content">
                <CalendarDate v-model="state.data.birth" />
              </div>
            </div>
            <div class="input-wrap">
              <div class="input-label"><span>전화번호</span></div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.tel">
                </label>
              </div>
            </div>
            <div class="input-wrap">
              <div class="input-label"><span>이메일</span></div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.email">
                </label>
              </div>
            </div>
            <div class="input-wrap">
              <div class="input-label"><span>주소</span></div>
              <div class="input-content">
                우편번호 검색API
              </div>
            </div>
          </div> <!--form-grid-->
        </div> <!-- pf-content-->
      </div>
    </div>

    <div class="content-wrap g20">
      <h3>학적 정보</h3>
      <div class="form-grid" style="--grid-cols: 1fr 1fr 1fr">
        <div class="input-wrap">
          <div class="input-label"><span>{{ state.data.role == 'student' ? '입학연도' : '입사연도' }}</span></div>
          <div class="input-content">
            <label>
              <CalendarDate v-model="state.data.birth" />
            </label>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label">상태</div>
          <div v-if="state.data.role == 'student'">
            <select name="status" v-model="state.data.status">
              <option value="재학" selected>재학</option>
              <option value="휴학">휴학</option>
              <option value="졸업">졸업</option>
              <option value="졸업">졸업</option>
              <option value="자퇴">자퇴</option>
            </select>
          </div>
          <div v-else-if="state.data.role == 'professor'">
            <select name="status" v-model="state.data.status">
              <option value="재직" selected>재직</option>
              <option value="휴직">휴직</option>
              <option value="퇴임">퇴임</option>
            </select>
          </div>
          <div v-else-if="state.data.role == 'admin'">
            <select name="status" v-model="state.data.status">
              <option value="재직" selected>재직</option>
              <option value="휴직">휴직</option>
              <option value="퇴사">퇴사</option>
            </select>
          </div>
        </div>
        <div v-if="state.data.role == 'student' || 'professor'" class="input-wrap">
          <div class="input-label">학과</div>
          <div class="input-content">
            <select name="status" v-model="state.data.majorId">
              <option value="">----학과선택----</option>
              <option v-for="major in state.majorList" :key="major.majorId" :value="major.majorId">{{ major.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label"></div>
          <div class="input-content">

          </div>
        </div>
      </div> <!--form-grid-->
    </div> <!-- content-wrap-->

    <div class="btn-row">
      <button class="btn btn-submit">계정 생성</button>
    </div>

  </form>

</template>

<style scoped></style>
