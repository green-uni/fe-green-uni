<script setup>
import CalendarDate from '@/components/util/CalendarDate.vue';
import majorService from '@/services/majorService';
import memberService from '@/services/memberService';
import { onMounted, reactive, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProfileImg from '@/components/common/ProfileImg.vue';
import { useAuthStore } from '@/stores/authentication';

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore()
// 수정모드
const ModifyMode = computed(() => route.path === '/member/me/mod')

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
    postcode: '',

    entryDate: '',
    exitDate: '',
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
  existPic: '',
  lab: { // 연구실 글자 합치기
    building: '',
    room: ''
  }
});
// 연구실 글자 합치기
const labRoom = computed(() => {
  return state.lab.building + ' ' + state.lab.room
})


const submit = async () => {
  if (!state.data.name) { //
    alert('이름을 작성해주세요.')
    return;
  }
  state.data.labRoom = labRoom.value

  //작성하지 않은 정보 null 처리
  const nullAllow = ['email', 'tel', 'email', 'emergencyTel', 'postcode', 'address', 'detailAddress', 'exitDate', 'pic']
  nullAllow.forEach(field => {
    if (!state.data[field]) state.data[field] = null
  })

  // 역할별로 작성하지 않을 정보 null 처리
  if (state.data.role === 'student') {
    state.data.degree = null
    state.data.position = null
    state.data.labRoom = null
    state.data.labTel = null
  } else if (state.data.role === 'professor') {
    state.data.academicYear = null
    state.data.semester = null
  }

  if (!state.pic && state.existPic) {
    state.data.pic = state.existPic  // ✅ 먼저!
  }

  const formData = new FormData();

  formData.append('req', new Blob([JSON.stringify(state.data)], { type: 'application/json' }));
  if (state.pic) {
    formData.append('pic', state.pic)
  }
  const res = await memberService.createMember(formData);

  if (res.status === 200) {
    router.push(ModifyMode.value ? '/member/me' : '/admin/members')
  }

}

const execDaumPostcode = () => {
  new window.daum.Postcode({
    oncomplete: (data) => {
      // 도로명 vs 지번 주소
      if (data.userSelectedType === 'R') {
        state.data.address = data.roadAddress
      } else { state.data.address = data.jibunAddress }
      // 우편번호
      state.data.postcode = data.zonecode
      // 상세주소 초기화
      state.data.detailAddress = ''
    }
  }).open()
}

onMounted(async () => {
  // 전공 목록 가져오기
  const res = await majorService.listForCreate();
  state.majorList = res.result;

  // 수정 모드일 경우 기존 데이터 띄우기
  if (ModifyMode.value) {
    const res = await memberService.findUserProfile()
    console.log(res.data.result)

    // 통신 결과 저장
    state.data = res.data.result
    state.data.role = authStore.role

    // role별 상태값 저장
    state.data.status = res.data.result.profStatus || res.data.result.stdStatus || res.data.result.stfStatus || '';

    // role별 전공 저장
    state.data.majorId = res.data.result.profMajorId || res.data.result.stdMajorId || '';

    // 이미지 저장
    state.existPic = res.data.result.pic

    if (res.data.result.labRoom) {
      const parts = res.data.labRoom.split(' ')
      state.lab.building = parts[0] || ''
      state.lab.room = parts[1] || ''
    }

  }
})

</script>

<template>
  <div class="form-wrap">
    <div class="content-wrap">
      <div class="d-flex">
        <div class="pf-profile">
          <div v-if="!ModifyMode" class="input-content radio-group">
            <label class="radio-label">
              <input type="radio" name="role" value="student" v-model="state.data.role">
              <span>학생</span>
            </label>
            <label class="radio-label">
              <input type="radio" name="role" value="professor" v-model="state.data.role">
              <span>교수</span>
            </label>
            <label class="radio-label">
              <input type="radio" name="role" value="admin" v-model="state.data.role">
              <span>관리자</span>
            </label>
          </div>
          <ProfileImg :editable="true" :memberId="ModifyMode ? authStore.loginUserId : null"
            :existPic="ModifyMode ? state.existPic : ''" v-model:pic="state.pic" />
        </div> <!-- pf-profile-->

        <div class="pf-content d-flex dire-col d-flex-grow1 g20">
          <h3>개인 정보</h3>
          <div class="form-grid" style="--grid-cols: 1fr 1fr">
            <div class="input-wrap">
              <div class="input-label"><span>이름</span></div>
              <div class="input-content">
                <label>
                  <input type="text" :disabled="ModifyMode" v-model="state.data.name" placeholder="이름">
                </label>
              </div>
            </div>
            <div class="input-wrap">
              <div class="input-label"><span>생년월일</span></div>
              <div class="input-content">
                <CalendarDate v-model="state.data.birth" :disabled="ModifyMode" />
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
              <div class="input-label"><span>비상<br>전화번호</span></div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.emergencyTel">
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
          </div> <!--form-grid-->
          <div class="form-grid">
            <div class="input-wrap">
              <div class="input-label"><span>주소</span></div>
              <div class="d-flex dire-col g10">
                <div class="input-content d-flex g10">
                  <button type="button" @click="execDaumPostcode()" class="btn btn-default">주소 찾기</button>
                  <label class="w200">
                    <input type="text" v-model="state.data.postcode" placeholder="우편번호" readonly>
                  </label>
                </div>
                <div class="input-content two-input">
                  <label>
                    <input type="text" v-model="state.data.address" placeholder="도로명 주소" readonly>
                  </label>
                  <label>
                    <input type="text" v-model="state.data.detailAddress" placeholder="상세주소를 입력해주세요">
                  </label>
                </div>
              </div>
            </div>
          </div> <!--form-grid-->
        </div> <!-- pf-content-->
      </div>
    </div>

    <div class="content-wrap g20" v-if="!ModifyMode || ( ModifyMode && state.data.role == 'professor' )">
      <h3>학적 정보</h3>
      <div class="form-grid" style="--grid-cols: 1fr 1fr 1fr">

        <div class="input-wrap" v-if="['student', 'professor'].includes(state.data.role)">
          <div class="input-label">학과</div>
          <div class="input-content">
            <select name="status" v-model="state.data.majorId" >
              <option value="">----학과선택----</option>
              <option v-for="major in state.majorList" :key="major.majorId" :value="major.majorId">{{ major.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="input-wrap" v-if="state.data.role == 'student'">
          <div class="input-label">학년</div>
          <div class="input-content">
            <label>
              <input type="number" v-model="state.data.academicYear">
            </label>
          </div>
        </div>
        <div class="input-wrap" v-if="state.data.role == 'student'">
          <div class="input-label">학기</div>
          <div class="input-content">
            <label>
              <input type="number" v-model="state.data.semester">
            </label>
          </div>
        </div>
        <div class="input-wrap" v-if="state.data.role == 'professor'">
          <div class="input-label">학위</div>
          <div class="input-content">
            <label>
              <input type="number" v-model="state.data.degree">
            </label>
          </div>
        </div>
        <div class="input-wrap" v-if="state.data.role == 'professor'">
          <div class="input-label">직위</div>
          <div class="input-content">
            <label>
              <input type="number" v-model="state.data.position">
            </label>
          </div>
        </div>

        <div class="input-wrap">
          <div class="input-label">상태</div>
          <div class="input-content" :disabled="ModifyMode" v-if="state.data.role == 'student'">
            <select name="status" v-model="state.data.status" :class="{ active: state.data.status !== '' }">
              <option value="재학" selected>재학</option>
              <option value="휴학">휴학</option>
              <option value="졸업">졸업</option>
              <option value="자퇴">자퇴</option>
            </select>
          </div>
          <div class="input-content" v-else-if="state.data.role == 'professor'">
            <select name="status" v-model="state.data.status" :class="{ active: state.data.status !== '' }">
              <option value="재직" selected>재직</option>
              <option value="휴직">휴직</option>
              <option value="퇴임">퇴임</option>
            </select>
          </div>
          <div class="input-content" v-else-if="state.data.role == 'admin'">
            <select name="status" v-model="state.data.status" :class="{ active: state.data.status !== '' }">
              <option value="재직" selected>재직</option>
              <option value="휴직">휴직</option>
              <option value="퇴사">퇴사</option>
            </select>
          </div>
        </div>



        <div class="input-wrap">
          <div class="input-label"><span>{{ state.data.role == 'student' ? '입학연도' : '입사연도' }}</span></div>
          <div class="input-content">
            <CalendarDate v-model="state.data.entryDate" />
          </div>
        </div>
        <div class="input-wrap">
          <div class="input-label"><span>
              {{ state.data.role == 'student' ? '졸업연도' :
                state.data.role == 'professor' ? '퇴임연도' : '퇴직연도' }}
            </span></div>
          <div class="input-content">
            <CalendarDate v-model="state.data.exitDate" />
          </div>
        </div>

        <div class="input-wrap" v-if="state.data.role == 'professor'">
          <div class="input-label">연구실</div>
          <div class="input-content two-input">
            <select name="labRoom" v-model="state.lab.building" :class="{ active: state.lab.building !== '' }">
              <option value="">건물 선택</option>
              <option value="공학관">공학관</option>
              <option value="인문관">인문관</option>
              <option value="과학관">과학관</option>
              <option value="정보관">정보관</option>
              <option value="예술관">예술관</option>
            </select>
            <input type="text" v-model="state.lab.room">
          </div>
        </div>

        <div class="input-wrap" v-if="state.data.role == 'professor'">
          <div class="input-label">연구실 <br>전화번호</div>
          <div class="input-content">
            <label>
              <input type="text" v-model="state.data.labTel">
            </label>
          </div>
        </div>
        {{ state.data.labRoom }}
      </div> <!--form-grid-->
    </div> <!-- content-wrap-->

    <div class="btn-row">
      <button @click="submit" class="btn btn-submit">{{ ModifyMode ? '수정' : '등록' }}</button>
    </div>

  </div>

</template>

<style scoped></style>
