<script setup>
import CalendarDate from '@/components/util/CalendarDate.vue';
import majorService from '@/services/majorService';
import { saveToLocalStorage, loadfromLocalStorage, clearLocalStorage, DRAFT_KEY } from '@/utils/button';
import { reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

const state = reactive({
  name: '',
  active: 'running', //정상 = running, 폐지 = closed
  college: '',
  room: '',
  tel: '',
  chairProfessor: '',
  capacity: '',
  startDate: '',
  info: ''
});

const colleges = ['인문대학', '자연대학', '공과대학', '예술대학', '교양학부'];

// 초기화
function reset() {
  Object.assign(state, {
    name: '', active: 'running', college: '',
    room: '', tel: '', chairProfessor: '',
    capacity: '', startDate: '', info: '',
  });
}

// 등록
async function submit() {
  try {
    const req = { ...state, capacity: state.capacity ? Number(state.capacity) : null };
    // ...state — 스프레드 문법으로 state의 모든 필드를 복사
    // capacity: state.capacity ? Number(state.capacity) : null — capacity만 따로 덮어씀
    // 왜냐면 input으로 받은 값은 항상 문자열이라서 숫자여야 하는 capacity만 변환하는 것

    if (isEdit.value) {
      await majorService.modifyMajor({ ...req, majorId: route.params.majorId });
      alert('학과 정보가 수정되었습니다.');
    } else {
      await majorService.createMajor(req);
      clearLocalStorage(DRAFT_KEY);
      alert('학과가 등록되었습니다.');
    }
    reset();
    router.push('/admin/major');
  } catch (e) {
    alert(isEdit.value ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
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

onMounted(async () => {
  if (isEdit.value) {
    try {
      const res = await majorService.getMajor(route.params.majorId);
      Object.assign(state, res.result ?? res);
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

const pageTitle = computed(() => isEdit.value ? '학과 정보 수정' : '학과 개설');

</script>

<template>
  <div class="container">
    <!-- <h3 class="section-title">{{ pageTitle }}</h3> -->
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
                <input type="radio" v-model="state.college" :value="col" />
                {{ col }}
              </label>
            </div>
          </div>
          <!-- 학과장명 / 학과 상태 -->
          <div class="input-wrap">
            <div class="input-label">학과장명</div>
            <div class="input-content">
              <label>
                <input v-model="state.chairProfessor" type="text" class="input-box narrow" />
              </label>
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
        <button class="btn btn-submit" @click="submit">등록</button>
        <button class="btn btn-default" @click="cancel" v-if="!route.params.majorId">취소</button>
        <button class="btn btn-default" @click="back" v-if="route.params.majorId">뒤로가기</button>
        <button class="btn btn-default" @click="save" v-if="!route.params.majorId">임시저장</button>
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
