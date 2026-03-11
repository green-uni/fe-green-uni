<script setup>
import majorService from '@/services/majorService';
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

// 달력 표시 여부
const showCalendar = ref(false);
const calendarMonth = ref(new Date().getMonth());
const calendarYear = ref(new Date().getFullYear());

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

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// 달력 날짜 계산
function getCalendarDays() {
  const firstDay = new Date(calendarYear.value, calendarMonth.value, 1).getDay();
  const daysInMonth = new Date(calendarYear.value, calendarMonth.value + 1, 0).getDate();
  const prevDays = new Date(calendarYear.value, calendarMonth.value, 0).getDate();
  const days = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevDays - i, currentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, currentMonth: true });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, currentMonth: false });
  }
  return days;
}

function prevMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11;
    calendarYear.value--;
  } else {
    calendarMonth.value--;
  }
}

function nextMonth() {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0;
    calendarYear.value++;
  } else {
    calendarMonth.value++;
  }
}

function selectDate(day) {
  if (!day.currentMonth) return;
  const mm = String(calendarMonth.value + 1).padStart(2, '0');
  const dd = String(day.day).padStart(2, '0');
  state.startDate = `${calendarYear.value}-${mm}-${dd}`;
  showCalendar.value = false;
}

function isSelectedDate(day) {
  if (!day.currentMonth || !state.startDate) return false;
  const [y, m, d] = state.startDate.split('-').map(Number);
  return y === calendarYear.value && m === calendarMonth.value + 1 && d === day.day;
}

function isToday(day) {
  if (!day.currentMonth) return false;
  const today = new Date();
  return today.getFullYear() === calendarYear.value &&
    today.getMonth() === calendarMonth.value &&
    today.getDate() === day.day;
}

// 등록
async function submit() {
  try {
    const req = { ...state, capacity: state.capacity ? Number(state.capacity) : null };
    // ...state — 스프레드 문법으로 state의 모든 필드를 복사
    // capacity: state.capacity ? Number(state.capacity) : null — capacity만 따로 덮어씀
    // 왜냐면 input으로 받은 값은 항상 문자열이라서 숫자여야 하는 capacity만 변환하는 것

    if (isEdit.value) {
      //수정 모드일 때는 majorId도 추가
      await majorService.modifyMajor({ ...req, majorId: route.params.majorId });
      alert('학과 정보가 수정되었습니다.');
    } else {
      await majorService.createMajor(req);
      localStorage.removeItem('majorCreateDraft');
      alert('학과가 등록되었습니다.');
    }
    reset();
    router.push('/admin/major')
  } catch (e) {
    alert(isEdit.value ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
    console.error(e);
  }
}

function cancel() {
    localStorage.removeItem('majorCreateDraft');
  reset();
}

function cancelMod() {
    localStorage.removeItem('majorCreateDraft');
  reset();
  router.push('/admin/major')
}

// 초기화
function reset() {
  Object.assign(state, {
    name: '', active: 'Y', college: '',
    room: '', tel: '', chairProfessor: '',
    capacity: '', startDate: '', info: '',
  });
}

// 임시저장
function save() {
  localStorage.setItem('majorCreateDraft', JSON.stringify(state));
  alert('임시저장 되었습니다.');
}

// onMounted에서 수정 모드면 기존 데이터 불러오기
onMounted(async () => {
  if (isEdit.value) {
    try {
      const res = await majorService.getMajor(route.params.majorId);
      Object.assign(state, res.result ?? res);
    } catch (e) {
      console.error('학과 정보 조회 실패', e);
    }
  } else {
    // 생성 모드일 때만 임시저장 복원
    const draft = localStorage.getItem('majorCreateDraft');
    if (draft) {
      Object.assign(state, JSON.parse(draft));
    }
  }
});

// 수정 모드 여부
const isEdit = computed(() => !!route.params.majorId); //!!: 값을 boolean으로 강제 변환하는 표현 => "majorId가 존재하면 true, 없으면 false" 를 깔끔하게 표현
const pageTitle = computed(() => isEdit.value ? '학과 정보 수정' : '학과 개설');
</script>

<template>
  <div class="page-wrapper">
    <h2 class="page-title">학과관리</h2>

    <div class="form-section">
      <h3 class="section-title">{{ pageTitle }}</h3>

      <div class="form-grid">
        <!-- 학과명 / 소속대학 -->
        <div class="form-row">
          <div class="form-field">
            <label class="field-label">학과명</label>
            <input v-model="state.name" type="text" class="input-box narrow" />
          </div>
          <div class="form-field college-field">
            <label class="field-label">소속대학</label>
            <div class="radio-group">
              <label v-for="col in colleges" :key="col" class="radio-label">
                <input type="radio" v-model="state.college" :value="col" />
                {{ col }}
              </label>
            </div>
          </div>
        </div>

        <!-- 학과장명 / 학과 상태 -->
        <div class="form-row">
          <div class="form-field">
            <label class="field-label">학과장명</label>
            <input v-model="state.chairProfessor" type="text" class="input-box narrow" />
          </div>
          <div class="form-field">
            <label class="field-label">학과 상태</label>
            <div class="radio-group">
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
        </div>

        <!-- 학과사무실 / 학과전화번호 -->
        <div class="form-row">
          <div class="form-field wide-label">
            <label class="field-label">학과사무실</label>
            <input v-model="state.room" type="text" class="input-box wide" />
          </div>
          <div class="form-field wide-label">
            <label class="field-label">학과전화번호</label>
            <input v-model="state.tel" type="text" class="input-box wide" placeholder="-없이 작성" onfocus="placeholder=''" onblur="placeholder='-없이 작성'" />
          </div>
        </div>

        <!-- 입학정원 / 학과개설일 -->
        <div class="form-row">
          <div class="form-field">
            <label class="field-label">입학정원</label>
            <input v-model="state.capacity" type="number" class="input-box narrow" />
          </div>
          <div class="form-field calendar-field">
            <label class="field-label">학과개설일</label>
            <div class="calendar-input-wrap">
              <input
                v-model="state.startDate"
                type="text"
                class="input-box medium"
                placeholder="YYYY-MM-DD"
                readonly
                @click="showCalendar = !showCalendar"
              />
              <button class="calendar-icon-btn" @click="showCalendar = !showCalendar">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </button>

              <!-- 달력 팝업 -->
              <div v-if="showCalendar" class="calendar-popup">
                <div class="cal-header">
                  <button class="cal-nav" @click="prevMonth">&#8249;</button>
                  <div class="cal-month-year">
                    <select v-model="calendarMonth" class="cal-select">
                      <option v-for="(m, idx) in monthNames" :key="idx" :value="idx">{{ m }}</option>
                    </select>
                    <select v-model="calendarYear" class="cal-select">
                      <option v-for="y in Array.from({length:10}, (_,i) => new Date().getFullYear()-5+i)" :key="y" :value="y">{{ y }}</option>
                    </select>
                  </div>
                  <button class="cal-nav" @click="nextMonth">&#8250;</button>
                </div>
                <div class="cal-days-header">
                  <span v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d">{{ d }}</span>
                </div>
                <div class="cal-days-grid">
                  <button
                    v-for="(day, idx) in getCalendarDays()"
                    :key="idx"
                    class="cal-day"
                    :class="{
                      'other-month': !day.currentMonth,
                      'selected': isSelectedDate(day),
                      'today': isToday(day) && !isSelectedDate(day),
                    }"
                    @click="selectDate(day)"
                  >
                    {{ day.day }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-row full">
          <div class="form-field full-width">
            <label class="field-label top">학과정보</label>
              <textarea
                v-model="state.info"
                class="notion-textarea"
                rows="6"
              />
          </div>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="btn-row">
        <button class="btn btn-primary" @click="submit">등록</button>
        <button class="btn btn-default" @click="cancel" v-if="!route.params.majorId">취소</button>
        <button class="btn btn-default" @click="cancelMod" v-if="route.params.majorId">취소</button>
        <button class="btn btn-secondary" @click="save" v-if="!route.params.majorId">임시저장</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  padding: 24px 32px;
  font-family: 'Noto Sans KR', sans-serif;
  color: #333;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.form-section {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 24px;
  background: #fff;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #444;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.form-row.full {
  align-items: flex-start;
}

.form-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-field.college-field {
  flex: 1;
}

.form-field.wide-label {
  flex: 1;
}

.form-field.full-width {
  width: 100%;
}

.field-label {
  font-size: 13px;
  color: #555;
  white-space: nowrap;
  min-width: 60px;
}

.field-label.top {
  align-self: flex-start;
  padding-top: 6px;
}

.input-box {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.input-box:focus {
  border-color: #4caf87;
}

.input-box.narrow { width: 120px; }
.input-box.medium { width: 160px; }
.input-box.wide   { width: 220px; }

/* 라디오 */
.radio-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  accent-color: #4caf87;
  cursor: pointer;
}

/* 달력 */
.calendar-field { position: relative; }

.calendar-input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
}

.calendar-icon-btn {
  background: #4caf87;
  border: none;
  border-radius: 4px;
  padding: 6px 8px;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
}

.calendar-popup {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 100;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  padding: 14px;
  width: 260px;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cal-nav {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #555;
  padding: 0 4px;
  line-height: 1;
}

.cal-month-year {
  display: flex;
  gap: 6px;
}

.cal-select {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 13px;
  cursor: pointer;
}

.cal-days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  color: #888;
  margin-bottom: 6px;
}

.cal-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-day {
  background: none;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  transition: background 0.15s;
  color: #333;
}

.cal-day:hover:not(.other-month) {
  background: #e8f5ee;
}

.cal-day.other-month {
  color: #ccc;
  cursor: default;
}

.cal-day.selected {
  background: #4caf87;
  color: #fff;
}

.cal-day.today {
  border: 1.5px solid #4caf87;
  color: #4caf87;
  font-weight: 600;
}

/* 버튼 */
.btn-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
}

.btn {
  padding: 8px 28px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.85; }

.btn-primary   { background: #4caf87; color: #fff; }
.btn-default   { background: #e0e0e0; color: #333; }
.btn-secondary { background: #4caf87; color: #fff; }

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
</style>