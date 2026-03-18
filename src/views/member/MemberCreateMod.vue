<script setup>
import { onMounted, reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authentication';
import { saveToLocalStorage, loadfromLocalStorage, clearLocalStorage, DRAFT_KEY } from '@/utils/button';
import { checkValidation, validateFields } from '@/utils/validation';

import CalendarDate from '@/components/util/CalendarDate.vue';
import SearchInput from '@/components/util/SearchInput.vue';
import ProfileImg from '@/components/common/ProfileImg.vue';

import majorService from '@/services/majorService';
import memberService from '@/services/memberService';

import { useModalStore } from '@/stores/modal'

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore()
const modal = useModalStore()

// 수정모드
const ModifyMode = computed(() => route.path === '/member/me/mod')
const AdminMode = computed(() => !!route.params.memberId)

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

 //화면에서 보이는 것들 삭제
function reset() {
  Object.assign(state, {
    data: { role: 'student', birth: '', name: '', email: '',  tel: '',  emergencyTel: '',  address: '',  detailAddress: '',  postcode: '',  entryDate: '',exitDate: '',  status: '', majorId: '',  academicYear: null,  semester: null,  degree: '',  position: '',  labRoom: '',  labTel: '' },
    pic: null,  existPic: '',
    lab: { building: '', room: '' }
  });
}

// 임시저장
function save() {
  saveToLocalStorage(DRAFT_KEY, state);
}
// 초기화
function cancel() {
  clearLocalStorage(DRAFT_KEY); //저장소 부분 삭제
  reset(); //화면에서 보이는 것들 삭제
}

const submit = async () => {
  //유효성 체크

  // role 공통 필수값
  const required = [
    { value: state.data.name, label: '이름' },
    { value: state.data.birth, label: '생년월일' },
    { value: state.data.entryDate, label: state.data.role === 'student' ? '입학연도' : '입사연도' },
    { value: state.data.status, label: '상태' },
  ]
  // role별 추가 필수값
  if (state.data.role === 'student') {
    required.push(
      { value: state.data.majorId, label: '학과' },
      { value: state.data.academicYear, label: '학년' },
      { value: state.data.semester, label: '학기' }
    )
  } else if (state.data.role === 'professor') {
    required.push(
      { value: state.data.majorId, label: '학과' },
      { value: state.data.degree, label: '학위' },
      { value: state.data.position, label: '직위' }
    )
  }
  if (!validateFields(required)) { return; } // field null 확인

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

  // 새로운 이미지가 없고, 기존 이미지가 있다면 -> 기존이미지 그대로 사용
  if (!state.pic && state.existPic) {
    state.data.pic = state.existPic
  }

  const formData = new FormData();

  formData.append('req', new Blob([JSON.stringify(state.data)], { type: 'application/json' }));
  if (state.pic) {
    formData.append('pic', state.pic)
  }

  try {
  const res = ModifyMode.value ? await memberService.modifyUserProfile(formData)
                              : await memberService.createMember(formData)

  await modal.showAlert(res.message, 'success');
  router.push(ModifyMode.value ? '/member/me' : '/admin/members')
  } catch (e) {
    console.error(e)
  }
}

// 도로명 주소 검색 API
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

// 수정모드일 때 기존 정보 가져오기
const initPage = async () => {
  // 전공 목록 가져오기
  const res = await majorService.listForCreate();
  state.majorList = res.result;

  if (ModifyMode.value) { // 수정 모드일 경우 기존 데이터 띄우기
    const res = await memberService.findUserProfile()
    console.log(res.data.result)

    // 통신 결과 저장
    state.data = res.data.result
    state.data.role = authStore.role

    // role별 상태값 저장
    state.data.status = res.data.result.profStatus || res.data.result.stdStatus || res.data.result.stfStatus || '';

    // role별 전공 저장
    state.data.majorId = res.data.result.profMajorId || res.data.result.stdMajorId || '';
    state.data.majorName = state.data.profMajorName || state.data.stdMajorName || ''

    // 교수 연구실 위치 저장
    if(state.data.labRoom){
      const labRoom = state.data.labRoom.split(" ");
      state.lab.building = labRoom[0];
      state.lab.room = labRoom[1];
    }

    // 이미지 저장
    state.existPic = res.data.result.pic
    console.log(state.existPic);

    if (res.data.result.labRoom) {
      const parts = res.data.labRoom.split(' ')
      state.lab.building = parts[0] || ''
      state.lab.room = parts[1] || ''
    }
  } else if(AdminMode.value){ // 관리자 수정 모드의 경우 // #TODO 관리자가 정보 수정
  }else { // 신규 생성시
    reset()//초기값 리셋
    const draft = loadfromLocalStorage(DRAFT_KEY);
    if (draft) { Object.assign(state, draft);   }
  }
}
onMounted(() => initPage())

// route 바뀔 때마다 다시 초기화
watch(() => route.path, () => initPage())
</script>

<template>
  <div class="form-wrap">
    <div v-if="!ModifyMode && !AdminMode" class="input-content radio-group radio-tab">
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

    <div class="d-flex g20 jc-center">
      <div class="pf-profile" v-if="!AdminMode">
        <ProfileImg :editable="true" :memberId="ModifyMode ? authStore.loginUserId : null"
          :existPic="ModifyMode ? state.existPic : ''" v-model:pic="state.pic" />
      </div> <!-- pf-profile-->

      <div class="pf-content d-grid g10 d-flex-grow1">
        <div class="content-wrap d-flex direct-col d-flex-grow1">
          <h3><font-awesome-icon icon="fa-solid fa-circle-info" />개인 정보<template v-if="ModifyMode"> 수정</template></h3>
          <div class="form-grid" style="--grid-cols:repeat(auto-fill, minmax(350px,1fr))">
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
                  <input type="text" v-model="state.data.tel" placeholder="-없이 작성">
                </label>
              </div>
            </div>
            <div class="input-wrap">
              <div class="input-label"><span>비상<br>전화번호</span></div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.emergencyTel" placeholder="-없이 작성">
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
            <div class="input-wrap g-col-full">
              <div class="input-label"><span>주소</span></div>
              <div class="d-flex direct-col g10">
                <div class="input-content d-flex g10">
                  <button type="button" @click="execDaumPostcode()" class="btn btn-line">주소 찾기</button>
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
        <div class="content-wrap" v-if="!ModifyMode || (ModifyMode && state.data.role == 'professor')">
          <h3><font-awesome-icon icon="fa-solid fa-circle-info" />
            {{ ModifyMode && state.data.role == 'professor'? '연구실 정보 수정' : '학적 정보' }}
          </h3>
          <div class="form-grid" :style="(ModifyMode || AdminMode)
                                  ? '--grid-cols: 1fr 1fr'
                                  : '--grid-cols: repeat(auto-fill, minmax(350px, 1fr))'">
            <div class="input-wrap" v-if="!ModifyMode && ['student', 'professor'].includes(state.data.role)">
              <div class="input-label">학과</div>
              <div class="input-content">
                <SearchInput v-model="state.data.majorName" :list="state.majorList" placeholder="학과명을 입력하세요"
                  @select="(major) => state.data.majorId = major.majorId" />
              </div>
            </div>

            <div class="input-wrap" v-if="!ModifyMode">
              <div class="input-label"><span>{{ state.data.role == 'student' ? '입학연도' : '입사연도' }}</span></div>
              <div class="input-content">
                <CalendarDate v-model="state.data.entryDate" :disabled="ModifyMode" />
              </div>
            </div>

            <div class="input-wrap"  v-if="!ModifyMode">
              <div class="input-label"><span>
                  {{ state.data.role == 'student' ? '졸업연도' :
                    state.data.role == 'professor' ? '퇴임연도' : '퇴직연도' }}
                </span></div>
              <div class="input-content">
                <CalendarDate v-model="state.data.exitDate" />
              </div>
            </div>
            <div class="input-wrap" v-if="!ModifyMode">
              <div class="input-label">상태</div>
              <div class="input-content" v-if="state.data.role == 'student'">
                <select name="status" v-model="state.data.status">
                  <option value="재학" selected>재학</option>
                  <option value="휴학">휴학</option>
                  <option value="졸업">졸업</option>
                  <option value="자퇴">자퇴</option>
                </select>
              </div>
              <div class="input-content" v-else-if="state.data.role == 'professor'">
                <select name="status" v-model="state.data.status">
                  <option value="재직" selected>재직</option>
                  <option value="휴직">휴직</option>
                  <option value="퇴임">퇴임</option>
                </select>
              </div>
              <div class="input-content" v-else-if="state.data.role == 'admin'">
                <select name="status" v-model="state.data.status">
                  <option value="재직" selected>재직</option>
                  <option value="휴직">휴직</option>
                  <option value="퇴사">퇴사</option>
                </select>
              </div>
            </div>

            <div class="input-wrap" v-if="!ModifyMode && state.data.role == 'student'">
              <div class="input-label">학년</div>
              <div class="input-content">
                <label>
                  <input type="number" v-model="state.data.academicYear">
                </label>
              </div>
            </div>
            <div class="input-wrap" v-if="!ModifyMode && state.data.role == 'student'">
              <div class="input-label">학기</div>
              <div class="input-content">
                <label>
                  <input type="number" v-model="state.data.semester">
                </label>
              </div>
            </div>
            <div class="input-wrap" v-if="!ModifyMode && state.data.role == 'professor'">
              <div class="input-label">학위</div>
              <div class="input-content">
                <label>
                  <input type="text" v-model="state.data.degree">
                </label>
              </div>
            </div>
            <div class="input-wrap" v-if="!ModifyMode && state.data.role == 'professor'">
              <div class="input-label">직위</div>
              <div class="input-content">
                <label>
                  <select name="position" v-model="state.data.position">
                    <option value="전임교수" selected>전임교수</option>
                    <option value="시간강사">시간강사</option>
                    <option value="조교수">조교수</option>
                    <option value="명예교수">명예교수</option>
                  </select>
                </label>
              </div>
            </div>


            <div class="input-wrap " v-if="state.data.role == 'professor'">
              <div class="input-label">연구실</div>
              <div class="input-content two-input">
                <select name="labRoom" v-model="state.lab.building">
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
          </div> <!--form-grid-->
        </div> <!-- content-wrap-->
      </div>
    </div>

    <div class="btn-row g10">
      <button class="btn btn-default" @click="router.go(-1)"><font-awesome-icon icon="fa-solid fa-arrow-left" /> 돌아가기</button>
      <button class="btn btn-line" v-if="!ModifyMode" @click="cancel"><font-awesome-icon icon="fa-solid fa-arrow-rotate-left" /> 초기화</button>
      <button class="btn btn-line" v-if="!ModifyMode" @click="save"><font-awesome-icon icon="fa-regular fa-circle-down" /> 임시저장</button>
      <button @click="submit" class="btn btn-submit"><font-awesome-icon icon="fa-solid fa-circle-check" /> {{ ModifyMode ? '수정' : '등록' }}</button>
    </div>

  </div>

</template>

<style scoped>
.form-wrap{}

.pf-profile { max-width: 220px; width: 30%; display: flex; flex-direction: column; gap: 10px;}


</style>
