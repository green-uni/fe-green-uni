<script setup>
import CalendarDate from '@/components/util/CalendarDate.vue';
import majorService from '@/services/majorService';
import { saveToLocalStorage, loadfromLocalStorage, clearLocalStorage, DRAFT_KEY } from '@/utils/button';
import { reactive, onMounted, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modal';
import SearchInput from '@/components/util/SearchInput.vue';
import { useAuthStore } from '@/stores/authentication';

const route = useRoute();
const router = useRouter();
const modal = useModalStore();
const authStore = useAuthStore();

const state = reactive({
  professorList: [],
  name: '',
  active: 'running', //정상 = running, 폐지 = closed
  college: '',
  room: '',
  tel: '',
  chairProfessorId: '',
  capacity: '',
  startDate: '',
  info: ''
});

// 상태에 따른 수정 불가 여부
const unActive = computed(() => {
  const role = authStore.role
  const status = authStore.stfStatus
  if (role === 'admin') return status === 'retirement'
  return false
})

const profSearchName = ref('');
const colleges = ['인문대학', '자연대학', '공과대학', '예술대학', '교양학부'];

// 초기화
function reset() {
  Object.assign(state, {
    name: '', active: 'running', college: '',
    room: '', tel: '', chairProfessorId: '',
    capacity: '', startDate: '', info: '',
  });
  profSearchName.value = '';
}

// 유효성 검사 함수
function validate() {
  const requiredFields = {
    name: '학과명',
    college: '소속대학',
    chairProfessorId: '학과장명',
    active: '학과 상태',
    room: '학과사무실',
    capacity: '입학정원',
    startDate: '개설일',
    tel: '전화번호'
  };

  for (const [key, label] of Object.entries(requiredFields)) {
    if (!state[key] || String(state[key]).trim() === '') {
      modal.showAlert(`${label}을(를) 입력해주세요.`, 'error');
      return false;
    }
  }
  return true;
}

// 등록
async function submit() {
  // 1. 유효성 검사 실행 (비어있는 칸이 있으면 중단)
  if (!validate()) return;

  try {
    const req = { ...state, capacity: state.capacity ? Number(state.capacity) : null };
    // ...state — 스프레드 문법으로 state의 모든 필드를 복사
    // capacity: state.capacity ? Number(state.capacity) : null — capacity만 따로 덮어씀
    // 왜냐면 input으로 받은 값은 항상 문자열이라서 숫자여야 하는 capacity만 변환하는 것

    if (isEdit.value) {
      await majorService.modifyMajor({ ...req, majorId: route.params.majorId });
      await modal.showAlert('학과 정보가 수정되었습니다.', 'success');
    } else {
      await majorService.createMajor(req);
      clearLocalStorage(DRAFT_KEY);
      await modal.showAlert('학과가 등록되었습니다.', 'success');
    }
    reset();
    router.push('/admin/major');
  } catch (e) {
   const errorMsg = e.response?.data?.result || '등록 중 오류가 발생했습니다.';
    modal.showAlert(errorMsg, 'error');
    console.error(e);
  }
}

// 취소 (작성 중이던 임시저장 데이터 삭제)
function cancel() {
  clearLocalStorage(DRAFT_KEY); //저장소 부분 삭제
  reset(); //화면에서 보이는 것들 삭제
}

function back() {
  router.push('/admin/major');
}

// 임시저장 버튼 클릭 시
function save() {
  saveToLocalStorage(DRAFT_KEY, state);
}

// 수정 모드 여부
const isEdit = computed(() => !!route.params.majorId); //!!: 값을 boolean으로 강제 변환하는 표현 => "majorId가 존재하면 true, 없으면 false" 를 깔끔하게 표현

// 교수 목록 가져오기 함수 추가
// 비록 목록을 처음부터 화면에 펼쳐서 보여주지는 않더라도, 사용자가 입력창에 글자를 쳤을 때 "어떤 데이터 중에서 검색할지"에 대한 기준 데이터가 프론트엔드 메모리에 미리 올라와 있어야 함
async function fetchProfessors() {
  try {
    const res = await majorService.getProfessorList();
    state.professorList = res.result;
  } catch (e) {
    console.error('교수 목록 조회 실패', e);
  }
}

// 교수 선택 시 실행될 함수
function handleProfessorSelect(professor) {
  profSearchName.value = professor.name;
  state.chairProfessorId = professor.memberId;
}

const ModifyMode = computed(() => !!route.params.majorId);

onMounted(async () => {
  if (authStore.stfStatus === 'retirement') {
    await modal.showAlert('재직 상태에서만 접근 가능합니다', 'error');
    router.go(-1)
    return;  // 이후 로직 실행 안 함
  }

  await fetchProfessors();

  if (isEdit.value) {
    try {
      const res = await majorService.getMajor(route.params.majorId);
      const data = res.result ?? res;
      Object.assign(state, data);
      // 수정 페이지 진입 시 학과장 이름을 검색창에 띄워줌
      profSearchName.value = data.chairProfessorName;

    } catch (e) {
      console.error('학과 정보 조회 실패', e);
    }
  } else {
    const draft = loadfromLocalStorage(DRAFT_KEY);
    if (draft) {
      Object.assign(state, draft);
    }
  }
});

</script>

<template>
  <div class="container" v-if="!unActive">
    <div class="form-wrap">
      <div class="content-wrap ">
        <div class="form-grid" style="--grid-cols:repeat(auto-fill, minmax(300px,1fr))">
          <!-- 학과명 / 소속대학 -->
          <div class="input-wrap">
            <div class="input-label">학과명</div>
            <div class="input-content">
              <label>
                <input type="text" v-model="state.name">
              </label>
            </div>
          </div>
          <div class="input-wrap input-grid3">
            <div class="input-label">소속대학</div>
            <div class="input-content radio-group">
              <label v-for="col in colleges" :key="col" class="radio-label">
                <input type="radio" v-model="state.college" :value="col" :disabled="ModifyMode"/>
                {{ col }}
              </label>
            </div>
          </div>
          <!-- 학과장명 / 학과 상태 -->
          <div class="input-wrap">
            <div class="input-label">학과장명</div>
            <div class="input-content">
              <SearchInput v-model="profSearchName" :list="state.professorList" labelKey="name" valueKey="memberId" placeholder="교수명을 입력하세요"
                @select="handleProfessorSelect" />
            </div>
          </div>
          <div class="input-wrap">
            <div class="input-label">학과 상태</div>
            <div class="input-content radio-group">
              <label class="radio-label">
                <input type="radio" v-model="state.active" value="running" />
                정상
              </label>
              <label class="radio-label">
                <input type="radio" v-model="state.active" value="closed" />
                폐지
              </label>
            </div>
          </div>

          <div class="input-wrap input-grid2">
            <div class="input-label">학과사무실</div>
            <div class="input-content">
              <label>
                <input v-model="state.room" type="text" class="input-box" />
              </label>
            </div>
          </div>

          <!-- 입학정원 / 학과개설일 -->
          <div class="input-wrap">
            <div class="input-label">입학정원</div>
            <div class="input-content">
              <label>
                <input v-model="state.capacity" type="number" class="input-box" />
              </label>
            </div>
          </div>
          <div class="input-wrap">
            <div class="input-label">개설일</div>
            <div class="input-content">
              <CalendarDate v-model="state.startDate" />
            </div>
          </div>
          <div class="input-wrap input-grid2">
            <div class="input-label">전화번호</div>
            <div class="input-content">
              <input v-model="state.tel" type="text" class="input-box wide" placeholder="-없이 작성"
                onfocus="placeholder=''" onblur="placeholder='-없이 작성'" />
            </div>
          </div>
          <div class="input-wrap input-grid-full">
            <div class="input-label">학과정보</div>
            <div class="input-content">
              <label>
                <textarea v-model="state.info" class="notion-textarea" rows="6" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn btn-submit" @click="submit" v-if="!route.params.majorId"><font-awesome-icon icon="fa-solid fa-circle-check" />등록</button>
        <button class="btn btn-submit" @click="submit" v-if="route.params.majorId"><font-awesome-icon icon="fa-solid fa-circle-check" />수정</button>
        <button class="btn btn-default" @click="cancel" v-if="!route.params.majorId"><font-awesome-icon icon="fa-regular fa-circle-xmark"/>취소</button>
        <button class="btn btn-default" @click="back" v-if="route.params.majorId"><font-awesome-icon icon="fa-solid fa-arrow-left" />뒤로가기</button>
        <button class="btn btn-default" @click="save" v-if="!route.params.majorId"><font-awesome-icon icon="fa-regular fa-circle-down" />임시저장</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #444;
}

.notion-textarea {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  font-size: 14px;
  font-family: 'Noto Sans KR', sans-serif;
  color: #37352f;
  line-height: 1.7;
  outline: none;
  padding: 10px 14px;
}

.notion-textarea:focus {
  border-color: var(--main-color);
}
</style>
