<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import attendanceService from '@/services/attendanceService';
import DataTable from '@/components/common/DataTable.vue';
import { useModalStore } from '@/stores/modal';
import CalendarDate from '@/components/util/CalendarDate.vue';
// import { VueDatePicker } from '@vuepic/vue-datepicker';
// import '@vuepic/vue-datepicker/dist/main.css';

const isStart = ref(false); //출석 시작 여부
const modal = useModalStore();
const router = useRouter();
const route = useRoute();
const lectureId = route.params.lectureId;

// 오늘 날짜로 초기화 (YYYY-MM-DD 형식)
const selectedDate = ref(new Date().toISOString().split('T')[0]); //문자열로 변경

const state = reactive({ 
    attendList: [],
    isLoading: false,
    recordedDates: [] //교수가 출석한 날짜는 연두색으로 표시하려고 삽입
});

//출석 기록 여부 확인. attendId가 있으면 저장된 기록이 있다고 인지
const hasRecord = computed( () =>
    state.attendList.some(student => student.attendId != null)
);

//출석 날짜에 연두색 표시 여부 확인
// const highlightDates = (date) => {
//     const dateStr = date.toISOString().split('T')[0];
//     return state.recordedDates.includes(dateStr);
// }

//출석 기록이 있는 날짜 목록 조회
const fetchRecordedDates = async () => {
    try {
        const res = await attendanceService.getRecordedDates(lectureId);
        state.recordedDates = res || [];
    } catch (error) {
        console.error('날짜 조회 실패:', error);
    }
}

//날짜가 바뀔 때 마다 자동으로 다시 불러오기
const fetchAttendance = async () => {
    state.isLoading = true;
    try {
        const res = await attendanceService.getAttendList(lectureId, selectedDate.value);
        state.attendList = res;
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        await modal.showAlert('출석 데이터 조회에 실패했습니다.', 'error');
    } finally {
        state.isLoading = false;
    }
};


//날짜 변경 시 isStart 초기화
watch(selectedDate, () => {
  isStart.value = false;
  fetchAttendance();
});

onMounted( () => {
    fetchAttendance();
    fetchRecordedDates(); //출석한 날짜에 연두색 표시 추가
});

const startAttendance = () => {
    isStart.value = true;
}

const saveAttendance = async () => {
    const confirm = await modal.showConfirm(`${selectedDate.value} 출석 정보를 저장하시겠습니까?`, 'info');
    if (!confirm) return;

    try {
        // 저장할 데이터 가공(attendId, status, reason만 추출)
        const req = state.attendList.map(student => ({
            attendId: student.attendId,
            status: student.status,
            reason: student.reason,
            attendDate: selectedDate.value
        }));

        await attendanceService.updateAttendList(lectureId, req);
        await modal.showAlert(`${selectedDate.value} 출석 정보가 저장되었습니다.`, 'success');

        await fetchRecordedDates();
        router.push(`/lectures/${lectureId}`);
    } catch (error) {
        console.error('저장 실패:', error);
        await modal.showAlert('출석 저장에 실패했습니다.', 'error');
    }
};
</script>

<template>
<div class="attendance-container">
    <div class="header-section">
        <h2>출석 관리 현황</h2>
        <div class="date-picker">
            <label>출석 일자 선택: </label>
            <!--출석된 날짜는 초록색으로 표시하려고 사용-->
            <CalendarDate
              v-model="selectedDate"
              :highlightedDates="state.recordedDates"
            />
            <!--출석 기록이 없고 시작 안 했을 때만 버튼 표시-->
            <button v-if="!hasRecord && !isStart"
            class="btn btn-submit" @click="startAttendance">출석 시작</button>
        </div>
    </div>

    <!--항상 테이블은 출력하지만 출석 기록이 없으면 emptyMessage대신 커스텀 메시지-->
      <DataTable
          :columns="['날짜', '학번', '이름', '학년', '학과', '출결상태', '비고(사유)']"
          :rows="(hasRecord || isStart) ? state.attendList : []"
          :isLoading="state.isLoading"
          gridCols="120px 120px 120px 120px 120px 200px 1fr"
          emptyMessage="출석 데이터가 없습니다.">
  
          <article class="tbl-row no-hover" v-for="student in state.attendList" :key="student.code">
              <div>{{ student.attendDate }}</div>
              <div>{{ student.code }}</div>
              <div>{{ student.name }}</div>
              <div>{{ student.academicYear }}학년</div>
              <div>{{ student.major }}</div>
              <div class="radio-group">
                  <label><input type="radio" :name="'status-' + student.code"
                          value="attend" v-model="student.status" /> 출석</label>
                  <label><input type="radio" :name="'status-' + student.code"
                          value="late" v-model="student.status" /> 지각</label>
                  <label><input type="radio" :name="'status-' + student.code"
                          value="absent" v-model="student.status" /> 결석</label>
              </div>
              <div>
                  <input type="text" v-model="student.reason"
                      placeholder="사유 입력" class="note-input" />
              </div>
          </article>
      </DataTable>
  
      <!--출석 기록이 있거나 시작했을 때만 버튼 표시-->
      <div class="save-btn-group" v-if="hasRecord || isStart">
          <button class="btn btn-submit" @click="router.push(`/lectures/${lectureId}`)">목록</button>
          <button class="btn btn-submit" @click="saveAttendance">저장</button>
      </div>
</div>
</template>

<style scoped>
.attendance-container { padding: 20px; }

.header-section {
    display: flex; flex-direction: row-reverse;
    justify-content: space-between; /* 제목과 달력을 양끝으로 배치하거나 조정 가능 */
    align-items: center; margin-bottom: 20px;
}

.date-picker {
    display: flex;
    align-items: center;
    gap: 10px; /* ✅ 달력과 버튼 사이 간격 */
}
.date-picker input {
    padding: 8px; border: 1px solid #ccc;
    border-radius: 4px; font-family: inherit;
}
:deep(.empty-message) {
    color: #c62828 !important;
    font-weight: 600;
    font-size: 16px;
}


/* 라디오 버튼 정렬 */
.radio-group {
    display: flex; justify-content: center;
    gap: 10px; font-size: 0.9rem;
}

.radio-group label {
    cursor: pointer; display: flex;
    align-items: center; gap: 4px;
}

.note-input {
    width: 90%; padding: 5px;
    border: 1px solid #eee;
}

.save-btn-group {
    display: flex; justify-content: flex-end;
    margin-top: 15px; gap: 8px;
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
</style>