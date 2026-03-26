<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useModalStore } from '@/stores/modal';
import DataTable from '@/components/common/DataTable.vue';
import CalendarDate from '@/components/util/CalendarDate.vue';
import Pagination from '@/components/common/Pagination.vue';
import SearchInput from '@/components/util/SearchInput.vue';
import LectureService from '@/services/lectureService';
import attendanceService from '@/services/attendanceService';

const route = useRoute();
const router = useRouter();
const modal = useModalStore();
const lectureId = route.params.lectureId;

const isMounting = ref(true);
const isStart = ref(false); //출석 시작 여부
const isEditMode = ref(false);  // 수정모드 여부

// 오늘 날짜로 초기화 (YYYY-MM-DD 형식)
const selectedDate = ref(new Date().toISOString().split('T')[0]); //문자열로 변경

const searchInput = ref('');

//페이징 처리 시작
const currentPage = ref(1);
const pageSize = 10;

const state = reactive({
  attendList: [],
  isLoading: false,
  recordedDates: [] //교수가 출석한 날짜는 연두색으로 표시하려고 삽입
});

//출석 화면에서 강의 정보(강의명과 수강인원) 띄우기 위함
const lectureInfo = reactive({
  lectureName: '',
  studentCount: 0,
  maxStd: 0
});

// #TODO
//출석 데이터 localStorage키(페이지를 벗어나도 수정된 정보가 남아있게 하기위해 사용)
const ATTEND_KEY = computed(() => 
    `attendance_${lectureId}_${selectedDate.value}`
);
const LAST_EDIT_KEY = `attendance_last_edit_${lectureId}`;

//출석 기록 여부 확인. attendId가 있으면 저장된 기록이 있다고 인지
const hasRecord = computed(() =>
  state.attendList.some(student => student.attendId != null)
);

//검색기능 추가
const filteredAttendList = computed(() => {
  if (!searchInput.value) return state.attendList;
  const keyword = searchInput.value.toLowerCase();
  return state.attendList.filter(s =>
    s.name?.toLowerCase().includes(keyword) ||
    s.code?.toString().includes(keyword) ||
    s.major?.toLowerCase().includes(keyword)
  );
});

const pagedAttendList = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredAttendList.value.slice(start, start + pageSize);
});

const maxPageAttend = computed(() => {
  return Math.ceil(filteredAttendList.value.length / pageSize) || 1;
});

//날짜 변경 시 isStart 초기화
watch(selectedDate, () => {
  if (isMounting.value) return; //마운트 중엔 watch 무시
  currentPage.value = 1;
  isStart.value = false;
  isEditMode.value = false;
  fetchAttendance();
});

//출석 기록이 있는 날짜 목록 조회
const fetchRecordedDates = async () => {
  try {
    const res = await attendanceService.getRecordedDates(lectureId);
    state.recordedDates = res || [];
  } catch (error) {
    console.error('날짜 조회 실패:', error);
  }
};

//날짜가 바뀔 때 마다 자동으로 다시 불러오기
const fetchAttendance = async () => {
  state.isLoading = true;
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const res = await attendanceService.getAttendList(lectureId, selectedDate.value);
    state.attendList = res;
    lectureInfo.studentCount = res.length; //강의정보 불러오기(강의명, 수강인원 등)
    
    const draft = localStorage.getItem(ATTEND_KEY.value);
    if (draft) {
      //임시저장 데이터가 있으면 모달로 확인
      const isConfirm = await modal.showConfirm(
        '기존에 수정 중이던 내용을 불러오시겠습니까?', 'info'
      );
      if (isConfirm) {
        //Ok를 누르면 기존 localStorage에 있던 데이터 복원
        const draftList = JSON.parse(draft);
        
        //res(원본) 순서 기준으로 draft 값만 덮어씌우기
        //이거 수정하지않으면 BE에서 가져오는 데이터순서(내가 지정한 ORDER BY m.name ASC(이름순))와
        //localStorage 데이터 순서가 다르기 때문에 내용수정후 다른페이지 다녀오면 row순서가 제각각임
        //수정내용 state.attendList.map => res.map 으로 수정
        state.attendList = res.map(student => {
          const saved = draftList.find(d => d.code === student.code);
          return saved ? { ...student, status: saved.status, reason: saved.reason } : student;
        });
        isEditMode.value = true; //기존 localStorage에서 저장된 값을 불러온다하면 바로 수정모드로 출력
        isStart.value = true;
      } else {
        //Cancel -> localStorage 삭제 후 원본 데이터 사용 + 오늘 날짜로 복원
        localStorage.removeItem(ATTEND_KEY.value);
        localStorage.removeItem(LAST_EDIT_KEY);
        selectedDate.value = today;
        const todayRes = await attendanceService.getAttendList(lectureId, today);
        state.attendList = todayRes;
        lectureInfo.studentCount = todayRes.length;
        isEditMode.value = false;
        isStart.value = false;
      }
    } else {
      state.attendList = res; //draft 없으면 원본값 그대로 출력
    }
  } catch (error) {
    console.error('데이터 로드 실패:', error);
    await modal.showAlert('출석 데이터 조회에 실패했습니다.', 'error');
  } finally {
    state.isLoading = false;
  }
};

const goToPage = (page) => {
  currentPage.value = page;
};

const startAttendance = () => {
  isStart.value = true;
};

//localStorage에 저장
const saveDraft = () => {
  localStorage.setItem(ATTEND_KEY.value, JSON.stringify(state.attendList));
  localStorage.setItem(LAST_EDIT_KEY, selectedDate.value); //수정중이던 날짜로 바로가려고 추가
};

const saveAttendance = async () => {
  const confirm = await modal.showConfirm(`${selectedDate.value} 출석 정보를 저장하시겠습니까?`, 'info');
  if (!confirm) return;
  
  try {
    // 저장할 데이터 가공
    const req = state.attendList.map(student => ({
      attendId: student.attendId,
      code: student.code,
      status: student.status,
      reason: student.reason,
      attendDate: selectedDate.value
    }));
    await attendanceService.updateAttendList(lectureId, req);

    //저장 후 다시 조회해서 attendId 확보
    //수정하다가 나갔다와서 저장누르고 다시확인해보면 저장이 될때도 있고 안될때도 있어서
    const res = await attendanceService.getAttendList(lectureId, selectedDate.value);
    state.attendList = res;

    //저장 완료시 localStorage 삭제
    localStorage.removeItem(ATTEND_KEY.value);
    localStorage.removeItem(LAST_EDIT_KEY);
    await modal.showAlert(`${selectedDate.value} 출석 정보가 저장되었습니다.`, 'success');
    await fetchRecordedDates();

    //페이지 이동 제거 및 수정모드만 종료하고 화면 유지
    isEditMode.value = false;
  } catch (error) {
    console.error('저장 실패:', error);
    await modal.showAlert('출석 저장에 실패했습니다.', 'error');
  }
};

onMounted(async () => {
  //재직 여부 확인
    if (authStore.profStatus !== 'employment') {
        await modal.showAlert('재직 중인 교수만 접근할 수 있습니다.', 'error');
        router.push(`/lectures/${lectureId}`);
        return;
    }

  //강의 정보 조회
  try {
    const res = await LectureService.findById(lectureId);
    const data = Array.isArray(res) ? res[0] : res;
    lectureInfo.lectureName = data.lectureName;
    lectureInfo.maxStd = data.maxStd;
  } catch (error) {
    console.error('강의 정보 조회 실패:', error);
  }

  //마지막 수정 날짜 확인
  const lastEditDate = localStorage.getItem(LAST_EDIT_KEY);

  if (lastEditDate) {
      //마지막 수정 날짜로 이동 후 모달 표시
      selectedDate.value = lastEditDate; //watch발동되지만 isMounting으로 막음
  }
  
  fetchAttendance();
  fetchRecordedDates(); //출석한 날짜에 연두색 표시 추가
  
  isMounting.value = false; //마운트 완료 후 watch 활성화
});
</script>

<template>
  <div class="attendance-container">
    
    <div class="header-section">
      <!-- 1행: 강의명 + 수강인원 -->
      <div class="table-header">
        <span class="lecture-name">{{ lectureInfo.lectureName }}</span>
        <span class="student-count">현재 수강:{{ lectureInfo.studentCount }} 전체 수강:{{ lectureInfo.maxStd }}</span>
      </div>
      <div class="right-section">
        <!-- 2행: 검색창 + 달력 + 출석시작버튼 -->
        <!-- 왼쪽: 검색창 -->
        <div class="search-area" v-if="hasRecord || isStart">
          <div class="input-content">
            <SearchInput v-model="searchInput" :list="state.attendList" placeholder="이름, 학번, 학과 검색"
              @update:modelValue="currentPage = 1" />
            <button class="btn in-input">
              <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
            </button>
          </div>
        </div>
        <div v-else></div> <!-- 검색창 없을 때 빈공간 -->

        <!-- 오른쪽: 출석시작버튼 + 달력 -->
        <div class="date-row">
          <div class="date-picker">
            <!--출석 기록이 없고 시작 안 했을 때만 버튼 표시-->
            <button v-if="!hasRecord && !isStart" class="btn btn-submit" @click="startAttendance">출석 시작</button>
            <!--출석된 날짜는 초록색으로 표시하려고 사용-->
            <div class="input-content">
              <CalendarDate v-model="selectedDate" :highlightedDates="state.recordedDates" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--항상 테이블은 출력하지만 출석 기록이 없으면 emptyMessage대신 커스텀 메시지-->
    <DataTable :columns="['날짜', '학번', '이름', '학년', '학과', '출결상태', '비고(사유)']"
      :rows="(hasRecord || isStart) ? pagedAttendList : []" :isLoading="state.isLoading"
      gridCols="120px 120px 120px 80px 200px 200px 1fr" emptyMessage="출석 데이터가 없습니다.">

      <article class="tbl-row no-hover" v-for="student in pagedAttendList" :key="student.code">
        <div>{{ student.attendDate }}</div>
        <div>{{ student.code }}</div>
        <div>{{ student.name }}</div>
        <div>{{ student.academicYear }}학년</div>
        <div>{{ student.major }}</div>

        <!--성적입력 창 최초 진입 시 수정모드가 아닌 현재 상태값이 그대로 출력되게 함-->
        <template v-if="!isEditMode">
          <div>{{ student.status === 'attend' ? '출석' :
            student.status === 'late' ? '지각' : '결석' }}</div>
          <div>{{ student.reason || '-' }}</div>
        </template>

        <template v-else>
          <div class="radio-group attend-radio">
            <label class="radio-label">
              <input type="radio" :name="'status-' + student.code" value="attend" v-model="student.status"
                @change="saveDraft" /> 출석
            </label>
            <label class="radio-label">
              <input type="radio" :name="'status-' + student.code" value="late" v-model="student.status"
                @change="saveDraft" /> 지각
            </label>
            <label class="radio-label">
              <input type="radio" :name="'status-' + student.code" value="absent" v-model="student.status"
                @change="saveDraft" /> 결석
            </label>
          </div>
          <div class="input-content">
            <input type="text" v-model="student.reason" @input="saveDraft" placeholder="사유 입력" class="note-input" />
          </div>
        </template>
      </article>
    </DataTable>
    <div class="footer-section">
      <Pagination :currentPage="currentPage" :maxPage="maxPageAttend" :pageGroupSize="10" @goToPage="goToPage" />
      <div class="btn-group">
        <button class="btn btn-default" @click="router.push(`/lectures/${lectureId}`)"><font-awesome-icon
            icon="fa-solid fa-arrow-left-long" /> 강의 정보</button>
        <!--출석 기록이 있거나 시작했을 때만 버튼 표시-->
        <div class="save-btn-group" v-if="hasRecord || isStart">
          <button v-if="!isEditMode" class="btn btn-default" @click="isEditMode = true">수정</button>
          <button v-else class="btn btn-submit" @click="saveAttendance"><font-awesome-icon
              icon="fa-solid fa-circle-check" /> 저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attendance-container {
    padding: 20px;
}
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}
.table-header {
    display: flex;
    align-items: end;
    gap: 10px;
}
.lecture-name {
    font-size: 1.5rem;
    font-weight: 700;
}
.student-count {
    padding-right: 10px;
    color:var(--font-color-light)
}
.date-row {
    display: flex;
    justify-content: flex-end;
}
.date-picker {
    display: flex;
    align-items: center;
    gap: 10px;
  /* ✅ 달력과 버튼 사이 간격 */
}
.date-picker input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
}
.right-section {  display: flex; align-items: center; gap: 8px;}
.search-area {  display: flex; align-items: center;  gap: 8px;}
.search-area .input-content{ position: relative;}
.search-area .input-content button{font-size: .825rem;position: absolute;top: 50%; transform: translateY(-50%);  right: 3px;}

.calendar-input-wrap{width: 170px;}


/* 라디오 버튼 정렬 */
.radio-group {
    display: flex;
    justify-content: center;
    gap: 10px;
    font-size: 0.9rem;
}

.radio-group label {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
}

.note-input {
    width: 90%;
    padding: 5px;
    border: 1px solid #eee;
}

.save-btn-group {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.no-record-box {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
}

.no-record-text {
    font-size: 24px;
    font-weight: 700;
    color: #c62828;
}
.input-content{width: 100%;}


.radio-label:nth-of-type(1):has(input[type='radio']:checked){color:var(--success);}
.radio-label:nth-of-type(1):has(input[type='radio']:checked):before{border-color:var(--success);}
.radio-label:nth-of-type(1):has(input[type='radio']:checked):after{background:var(--success);}

.radio-label:nth-of-type(2):has(input[type='radio']:checked){ color:var(--warning);}
.radio-label:nth-of-type(2):has(input[type='radio']:checked):before{border-color:var(--warning);}
.radio-label:nth-of-type(2):has(input[type='radio']:checked):after{background:var(--warning);}

.radio-label:nth-of-type(3):has(input[type='radio']:checked){color:var(--error);}
.radio-label:nth-of-type(3):has(input[type='radio']:checked):before{border-color:var(--error);}
.radio-label:nth-of-type(3):has(input[type='radio']:checked):after{background:var(--error);}


</style>
